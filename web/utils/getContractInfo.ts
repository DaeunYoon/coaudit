import { getChainConfigs } from './index';
import axios from 'axios';
import type { Contract, SupportedChain } from '@/types';

export default async function getContractInfo(
  address: string,
  chain: SupportedChain
): Promise<Contract[]> {
  const { endpoint, apiKey } = getChainConfigs(chain);
  if (!apiKey) {
    throw new Error('No API key');
  }

  const fetchingURL = `${endpoint}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

  try {
    const { data } = await axios.get(fetchingURL);

    const contracts = [];

    const source = data.result[0].SourceCode;
    const slicedSource = source.substring(1, source.length - 1);

    const contractBase = {
      address: address,
      chain: chain,
      contractName: data.result[0].ContractName,
      abi: data.result[0].ABI,
      compilerVersion: data.result[0].CompilerVersion,
      optimizationUsed: Number(data.result[0].OptimizationUsed),
      runs: Number(data.result[0].Runs),
      constructorArguments: data.result[0].ConstructorArguments,
      evmVersion: data.result[0].EVMVersion,
      library: data.result[0].Library,
      licenseType: data.result[0].LicenseType,
      proxy: data.result[0].Proxy,
      implementation: data.result[0].Implementation,
      swarmSource: data.result[0].SwarmSource,
    };

    try {
      // When there are more than one contract
      const parsedSource = JSON.parse(slicedSource);
      const contractPaths = Object.keys(parsedSource.sources);
      for (const contractPath of contractPaths) {
        const eachSource = parsedSource.sources[contractPath].content;
        contracts.push({
          ...contractBase,
          contractPath,
          sourceCode: eachSource,
        });
      }
    } catch (error) {
      // When there are only one contract
      contracts.push({
        ...contractBase,
        contractPath: `/${contractBase.contractName}.sol`,
        sourceCode: data.result[0].SourceCode,
      });
    }

    // update contracts to database
    return contracts;
  } catch (error: any) {
    console.error(error);
    // Mode endpoint returns 404 when there is no contract
    if (error.response.status === 404) {
      return [];
    }
    throw error;
  }
}
