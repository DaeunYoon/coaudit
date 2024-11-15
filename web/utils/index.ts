import type { SupportedChain } from '@/types';

export const chainConfigs: Readonly<
  Record<
    SupportedChain,
    {
      endpoint: string;
      apiKey: string | undefined;
      name: string;
      chainId: number;
    }
  >
> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    endpoint: 'https://api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export const getChainConfigs = (chain: SupportedChain) => {
  const config = chainConfigs[chain];
  if (!config) {
    throw new Error('Invalid chain');
  }
  return config;
};

export const getChainNameById = (chainId: number) => {
  const chain = Object.entries(chainConfigs).find(
    ([_, chainConfigs]) => chainConfigs.chainId === chainId
  );
  return chain ? chain[0] : undefined;
};
