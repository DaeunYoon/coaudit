import { getChainConfigs } from "@/utils";
import axios from "axios";
import type { Contract } from "@/types";
import getRedis from "./getRedis";
import { Chain } from "@/lib/chains";

export default async function getContractInfo(
  address: string,
  chain: Chain
): Promise<Contract[]> {
  const redis = getRedis();

  const redisKey = `contracts:${chain}:${address}`;

  const cachedContracts = (await redis.get(redisKey)) as Contract[];

  if (cachedContracts?.length > 0) {
    return cachedContracts;
  }

  const { endpoint } = getChainConfigs(chain);
  const fetchingURL = `${endpoint}/api/v2/smart-contracts/${address}`;

  try {
    const { data: contract } = await axios.get(fetchingURL);

    const baseContract = {
      address,
      chain,
      contractName: contract.name,
      abi: contract.abi,
      compilerVersion: contract.compiler_version,
      optimizationEnabled: contract.optimization_enabled,
      runs: contract.compiler_settings.optimizer
        ? Number(contract.compiler_settings.optimizer.runs)
        : undefined,
      constructorArguments: contract.constructor_args,
      evmVersion: contract.evm_version,
      libraries: contract.external_libraries,
      licenseType: contract.license_type,
      proxy: contract.proxy_type,
      implementation: contract.implementations?.[0]?.address,
    };

    const contracts: Contract[] = [];

    // Add compiled contract
    contracts.push({
      ...baseContract,
      sourceCode: contract.source_code,
      contractPath: contract.file_path,
    });

    // Add additional sources
    const additionalSources = contract.additional_sources;
    for (const source of additionalSources) {
      contracts.push({
        ...baseContract,
        contractPath: source.file_path,
        sourceCode: source.source_code,
      });
    }

    // add contracts to redis
    await redis.set(redisKey, contracts);

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
