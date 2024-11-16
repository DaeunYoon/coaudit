export type SupportedChain = 'ethereum';

export declare interface AddressInfo {
  contractPath: string;
  contractName: string;
  address: string;
  locStartLine: number;
  locStartCol: number;
  locEndLine: number;
  locEndCol: number;
  rangeTo?: number;
  rangeFrom?: number;
  getAddress?: (...args: any) => Promise<any>;
  source:
    | 'variable'
    | 'hardcoded'
    | 'interface'
    | 'public_function'
    | 'external_function'
    | 'private_function'
    | 'state';
}

export interface LocalFunctionDefinition {
  functionName: string;
  functionParameters: string[];
  contractPath: string;
  contractName: string;
  locStartCol: number;
  locEndLine: number;
  locEndCol: number;
  rangeTo?: number;
  rangeFrom?: number;
}

export interface LocalFunctionCall {
  functionName: string;
  functionParameters: string[];
  contractPath: string;
  contractName: string;
  locStartCol: number;
  locEndLine: number;
  locEndCol: number;
  rangeTo?: number;
  rangeFrom?: number;
  // Include additional info from the corresponding definition if available
  functionDefinition: LocalFunctionDefinition;
}

export interface ParsedInformation {
  addresses: AddressInfo[];
  localFunctionCalls: LocalFunctionCall[];
  localFunctionDefinitions: LocalFunctionDefinition[];
}

export interface Contract {
  address: string;
  chain: string;
  contractName: string;
  contractPath: string;
  sourceCode: string;
  abi: string;
  compilerVersion: string;
  optimizationUsed: number;
  runs: number;
  constructorArguments: string;
  evmVersion: string;
  library: string;
  licenseType: string;
  proxy: boolean;
  implementation: string;
  swarmSource: string;
}
