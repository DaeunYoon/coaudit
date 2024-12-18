import { parse, visit } from "@solidity-parser/parser";
import {
  ASTNode,
  BaseASTNode,
  VariableDeclaration,
  FunctionDefinition,
} from "@solidity-parser/parser/dist/src/ast-types";
import {
  AddressInfo,
  Contract,
  LocalFunctionDefinition,
  LocalFunctionCall,
} from "@/types";
import loadContractLibraries from "./loadContractLibraries";
import { Contract as EthersContract, utils } from "ethers";
import { FormatTypes } from "ethers/lib/utils";

import getAbiIfReturnsAddress from "./getAbiIfReturnsAddress";
import getProvider from "./getProvider";
import getContractInfo from "./getContractInfo";

const isAddress = (val: string) => {
  return val.length === 42 && val.startsWith("0x");
};

function getAst(val: string) {
  try {
    return parse(val, { loc: true, range: true });
  } catch (e) {
    console.error(e);
    return null;
  }
}

function getFlatLocationInfo(node: ASTNode | BaseASTNode) {
  if (!node.loc) {
    throw new Error("No location info");
  }
  return {
    locStartLine: node.loc.start.line,
    locStartCol: node.loc.start.column,
    locEndLine: node.loc.end.line,
    locEndCol: node.loc.end.column,
    rangeFrom: node.range ? node.range[0] : undefined,
    rangeTo: node.range ? node.range[1] : undefined,
  };
}

const findMatchingId = (
  discovered: Record<string, string>,
  name: string,
  range?: [number, number]
) => {
  const stateVarsWithMatchingName = Object.keys(discovered).filter((key) =>
    key.startsWith(`${name} `)
  );
  if (stateVarsWithMatchingName.length === 0) {
    return;
  }
  const targetRangeStart = range ? range[0] : undefined;
  if (!targetRangeStart) {
    return;
  }
  let relevantDeclarationRangeStart: number = 0;
  stateVarsWithMatchingName.forEach((key) => {
    const [_varName, rangeStart] = key.split(" ");
    if (
      targetRangeStart >= Number(rangeStart) &&
      Number(rangeStart) > relevantDeclarationRangeStart
    ) {
      relevantDeclarationRangeStart = Number(rangeStart);
    }
  });
  return `${name} ${relevantDeclarationRangeStart}`;
};

const getVariableId = (varName: string, node: ASTNode) =>
  `${varName} ${node.range ? node.range[0] : ""}`;

const getFunctionDefinitionInfo = (
  node: FunctionDefinition,
  contractName: string,
  contractPath: string
): any => {
  return {
    functionName: node.name,
    functionParameters: node.parameters.map((param) => {
      if (param.typeName?.type === "ElementaryTypeName") {
        return param.typeName.name;
      }
      return param.typeName?.type;
    }),
    contractPath,
    contractName,
    ...getFlatLocationInfo(node),
  };
};

export default async (contractInfo: Contract) => {
  const { contractName, contractPath, sourceCode, address, chain } =
    contractInfo;
  const ast = getAst(sourceCode);
  const addresses: AddressInfo[] = [];
  const localFunctionDefinitions: LocalFunctionDefinition[] = [];
  const localFunctionCalls: LocalFunctionCall[] = [];

  visit(ast, {
    FunctionDefinition(node) {
      if (!node.name) {
        return;
      }

      // Capture local function definition information
      const functionDefInfo = getFunctionDefinitionInfo(
        node,
        contractName,
        contractPath
      );
      localFunctionDefinitions.push(functionDefInfo); // Save the local function definition
    },

    // Number literals are added twice, so we skip every second one
    NumberLiteral: (node) => {
      if (isAddress(node.number) && node.loc) {
        addresses.push({
          contractPath,
          contractName,
          address: node.number,
          locStartLine: node.loc.start.line,
          locStartCol: node.loc.start.column,
          locEndLine: node.loc.end.line,
          locEndCol: node.loc.end.column,
          rangeFrom: node.range ? node.range[0] : undefined,
          rangeTo: node.range ? node.range[1] : undefined,
          source: "hardcoded",
        });
      }
    },
  });

  const discoveredVariables: Record<string, string> = {};
  const discoveredStateVars: Record<string, string> = {};
  visit(ast, {
    FunctionCall(node) {
      const parameterTypes = node.arguments.map((arg) =>
        arg.type === "ElementaryTypeName" || arg.type === "Identifier"
          ? arg.name
          : arg.type
      );

      const functionName =
        node.expression.type === "Identifier" ? node.expression.name : "";

      const functionDefinition =
        localFunctionDefinitions.find(
          (def) =>
            def.functionName === functionName &&
            // This needs to be improved
            def.functionParameters.length === parameterTypes.length
        ) || undefined;

      if (!functionDefinition) {
        return;
      }

      const functionCallInfo = {
        functionName,
        functionParameters: parameterTypes,
        contractPath,
        contractName,
        functionDefinition,
        ...getFlatLocationInfo(node),
      };

      localFunctionCalls.push(functionCallInfo);
    },

    VariableDeclarationStatement(node, variableDeclarationParent) {
      const initValue = node.initialValue;
      if (
        !initValue ||
        initValue.type !== "NumberLiteral" ||
        !isAddress(initValue.number)
      ) {
        return;
      }
      // only supports single variable in assignment such as `address a = 0x1234`
      const nodeVars = node.variables;
      if (!nodeVars || nodeVars.length !== 1) {
        return;
      }
      const variableDeclaration = nodeVars[0];
      if (
        !variableDeclaration ||
        variableDeclaration.type !== "VariableDeclaration"
      ) {
        return;
      }
      const varName = (variableDeclaration as VariableDeclaration).name;
      const varDeclarationIdentifier = (
        variableDeclaration as VariableDeclaration
      ).identifier;
      if (!varName || !varDeclarationIdentifier) {
        return;
      }
      addresses.push({
        ...getFlatLocationInfo(varDeclarationIdentifier),
        contractPath,
        contractName,
        source: "variable",
        address: initValue.number,
      });
      // If variable declaraton is in block (curly brackets) - search it for the name occurence
      if (
        !variableDeclarationParent ||
        variableDeclarationParent.type !== "Block"
      ) {
        return;
      }
      discoveredVariables[getVariableId(varName, variableDeclarationParent)] =
        initValue.number;
      visit(variableDeclarationParent, {
        Identifier(identifierNode) {
          const isNotReferenceToDeclaredVar =
            identifierNode.name !== varName ||
            (identifierNode.range &&
              varDeclarationIdentifier.range &&
              identifierNode.range[0] === varDeclarationIdentifier.range[0]);
          if (isNotReferenceToDeclaredVar) {
            return;
          }
          addresses.push({
            ...getFlatLocationInfo(identifierNode),
            contractPath,
            address: initValue.number,
            contractName,
            source: "variable",
          });
        },
      });
    },
  });
  visit(ast, {
    StateVariableDeclaration(node) {
      const initValue = node.initialValue;
      if (
        !initValue ||
        initValue.type !== "NumberLiteral" ||
        !isAddress(initValue.number)
      ) {
        return;
      }
      // only supports single variable in assignment such as `address a = 0x1234`
      const nodeVars = node.variables;
      if (!nodeVars || nodeVars.length !== 1) {
        return;
      }
      const variableDeclaration = nodeVars[0];
      if (
        !variableDeclaration ||
        variableDeclaration.type !== "VariableDeclaration"
      ) {
        return;
      }
      const varName = (variableDeclaration as VariableDeclaration).name;
      if (!varName) {
        return;
      }
      if (!variableDeclaration.identifier) {
        return;
      }
      addresses.push({
        ...getFlatLocationInfo(variableDeclaration.identifier),
        contractPath,
        contractName,
        address: initValue.number,
        source: "state",
      });
      discoveredStateVars[
        getVariableId(varName, variableDeclaration.identifier)
      ] = initValue.number;
    },
  });
  visit(ast, {
    Identifier(node) {
      const stateVarsWithMatchingName = Object.keys(discoveredStateVars).filter(
        (key) => key.startsWith(`${node.name} `)
      );
      if (stateVarsWithMatchingName.length === 0) {
        return;
      }
      const targetRangeStart = node.range ? node.range[0] : undefined;
      if (!targetRangeStart) {
        return;
      }
      let relevantDeclarationRangeStart: number = 0;
      stateVarsWithMatchingName.forEach((key) => {
        const [_varName, rangeStart] = key.split(" ");
        if (
          targetRangeStart >= Number(rangeStart) &&
          Number(rangeStart) > relevantDeclarationRangeStart
        ) {
          relevantDeclarationRangeStart = Number(rangeStart);
        }
      });
      if (relevantDeclarationRangeStart === targetRangeStart) {
        return;
      }
      const addressValue =
        discoveredStateVars[`${node.name} ${relevantDeclarationRangeStart}`] ||
        undefined;
      if (!addressValue) {
        return;
      }
      addresses.push({
        ...getFlatLocationInfo(node),
        contractPath,
        contractName,
        address: addressValue,
        source: "state",
      });
    },
  });
  const loadedLibraries = await loadContractLibraries(address, chain);
  const monitoredFunctions: Record<string, string[]> = {};
  for (const [libraryName, libraryAddress] of Object.entries(loadedLibraries)) {
    const { abi } = (await getContractInfo(libraryAddress, chain))[0];
    if (!abi) {
      continue;
    }
    const iface = new utils.Interface(abi);
    const ifaceElements = iface.format(FormatTypes.full);
    if (!(ifaceElements instanceof Array)) {
      continue;
    }
    const relevantFunctions = ifaceElements.filter(
      (element) =>
        element.startsWith("function") && element.includes("returns (address)")
    );
    const relevantFunctionNames = relevantFunctions.map(
      (element) => element.split(" ")[1].split("(")[0]
    );
    monitoredFunctions[libraryName] = relevantFunctionNames;
  }
  visit(ast, {
    MemberAccess(node, parent) {
      const memberAccessExpression = node.expression;
      if (!parent || parent.type !== "FunctionCall") {
        return;
      }
      // if something like `libraryName.functionName()`
      if (memberAccessExpression.type === "Identifier") {
        if (
          !Object.keys(loadedLibraries).includes(memberAccessExpression.name)
        ) {
          return;
        }
        if (
          !Object.keys(monitoredFunctions).includes(memberAccessExpression.name)
        ) {
          return;
        }
        if (
          !monitoredFunctions[memberAccessExpression.name].includes(
            node.memberName
          )
        ) {
          return;
        }
        const calledFunction = node.memberName;
        const libraryAddress = loadedLibraries[memberAccessExpression.name];
        const argsToUse = parent.arguments.map((arg) => {
          if (arg.type === "NumberLiteral") {
            return arg.number;
          }
          if (arg.type === "StringLiteral") {
            return arg.value;
          }
          if (arg.type === "Identifier") {
            const matchingVal =
              findMatchingId(discoveredStateVars, arg.name, arg.range) ||
              findMatchingId(discoveredVariables, arg.name, arg.range) ||
              undefined;
            if (!matchingVal) {
              return;
            }
            const val =
              discoveredStateVars[matchingVal] ||
              discoveredVariables[matchingVal] ||
              undefined;
            if (!val) {
              return null;
            }
            return val;
          }
        });
        if (argsToUse.includes(null)) {
          return;
        }
        addresses.push({
          ...getFlatLocationInfo(node),
          contractPath,
          contractName,
          address: "",
          source: "public_function",
          getAddress: async () => {
            const abi = await getAbiIfReturnsAddress(
              libraryAddress,
              chain,
              calledFunction
            );
            if (!abi) {
              throw new Error(
                `Could not find ABI for ${libraryAddress} on ${chain}`
              );
            }
            const provider = getProvider(chain);
            const contract = new EthersContract(libraryAddress, abi, provider);
            const formattedArgs = (argsToUse as string[]).map((arg) => {
              if (isAddress(arg)) {
                return arg;
              }
              return utils.formatBytes32String(arg);
            });
            return await contract[calledFunction](...formattedArgs);
          },
        });
      }
      // if something like `interface(0x123).functionName(0x1234)`
      if (memberAccessExpression.type !== "FunctionCall") {
        return;
      }
      const memberAccessFunctionCallExpression =
        memberAccessExpression.expression;
      if (memberAccessFunctionCallExpression.type !== "Identifier") {
        return;
      }
      const memberAccessFunctionCallArguments =
        memberAccessExpression.arguments;
      if (memberAccessFunctionCallArguments.length !== 1) {
        return;
      }
      const memberAccessFunctionCallArgument =
        memberAccessFunctionCallArguments[0];
      if (
        memberAccessFunctionCallArgument.type !== "NumberLiteral" &&
        memberAccessFunctionCallArgument.type !== "Identifier"
      ) {
        return;
      }
      if (memberAccessFunctionCallArgument.type === "Identifier") {
        const matchingName =
          findMatchingId(
            discoveredStateVars,
            memberAccessFunctionCallArgument.name,
            memberAccessFunctionCallArgument.range
          ) ||
          findMatchingId(
            discoveredVariables,
            memberAccessFunctionCallArgument.name,
            memberAccessFunctionCallArgument.range
          ) ||
          undefined;
        if (!matchingName) {
          return;
        }
        const addressToCall =
          discoveredStateVars[matchingName] ||
          discoveredVariables[matchingName] ||
          undefined;
        if (!addressToCall) {
          return;
        }
        const functionToCall = node.memberName;
        const argsToUse = parent.arguments.map((arg) => {
          if (arg.type === "NumberLiteral") {
            return arg.number;
          }
          if (arg.type === "StringLiteral") {
            return arg.value;
          }
          if (arg.type === "Identifier") {
            const matchingVal =
              findMatchingId(discoveredStateVars, arg.name, arg.range) ||
              findMatchingId(discoveredVariables, arg.name, arg.range) ||
              undefined;
            if (!matchingVal) {
              return;
            }
            const val =
              discoveredStateVars[matchingVal] ||
              discoveredVariables[matchingVal] ||
              undefined;
            if (!val) {
              return null;
            }
            return val;
          }
        });
        if (argsToUse.includes(null)) {
          return;
        }
        addresses.push({
          ...getFlatLocationInfo(node),
          contractPath,
          contractName,
          address: "",
          source: "public_function",
          getAddress: async () => {
            const abi = await getAbiIfReturnsAddress(
              addressToCall,
              chain,
              functionToCall
            );
            if (!abi) {
              throw new Error(
                `Could not find ABI for ${addressToCall} on ${chain}`
              );
            }
            const provider = getProvider(chain);
            const contract = new EthersContract(addressToCall, abi, provider);
            const formattedArgs = (argsToUse as string[]).map((arg) => {
              if (isAddress(arg)) {
                return arg;
              }
              return utils.formatBytes32String(arg);
            });
            return await contract[functionToCall](...formattedArgs);
          },
        });
      } else if (memberAccessFunctionCallArgument.type === "NumberLiteral") {
        const addressToCall = memberAccessFunctionCallArgument.number;
        const functionToCall = node.memberName;
        const argsToUse = parent.arguments.map((arg) => {
          if (arg.type === "NumberLiteral") {
            return arg.number;
          }
          if (arg.type === "StringLiteral") {
            return arg.value;
          }
          if (arg.type === "Identifier") {
            const val =
              discoveredStateVars[arg.name] ||
              discoveredVariables[arg.name] ||
              undefined;
            if (!val) {
              return null;
            }
            return val;
          }
        });
        if (argsToUse.includes(null) || argsToUse.includes(undefined)) {
          return;
        }
        addresses.push({
          ...getFlatLocationInfo(node),
          contractPath,
          contractName,
          address: "",
          source: "public_function",
          getAddress: async () => {
            const abi = await getAbiIfReturnsAddress(
              addressToCall,
              chain,
              functionToCall
            );
            if (!abi) {
              throw new Error(
                `Could not find ABI for ${addressToCall} on ${chain}`
              );
            }
            const provider = getProvider(chain);
            const contract = new EthersContract(addressToCall, abi, provider);
            const formattedArgs = (argsToUse as string[]).map((arg) => {
              if (isAddress(arg)) {
                return arg;
              }
              return utils.formatBytes32String(arg);
            });
            return await contract[functionToCall](...formattedArgs);
          },
        });
      }
    },
  });
  const resolvedAddressIdx: number[] = [];
  await Promise.all(
    addresses.map(async (address, i) => {
      if (!address.getAddress) {
        resolvedAddressIdx.push(i);
        return;
      }
      try {
        address.address = await address.getAddress();
        resolvedAddressIdx.push(i);
      } catch (e) {
        console.error(e);
        return;
      }
    })
  );
  return {
    addresses: addresses.filter((_, i) => resolvedAddressIdx.includes(i)),
    localFunctionCalls,
    localFunctionDefinitions,
  };
};
