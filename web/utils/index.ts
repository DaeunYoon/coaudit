import { Chain } from "@/lib/chains";

export const chainConfigs: Readonly<
  Record<
    Chain,
    {
      endpoint: string;
      name: string;
      chainId: number;
    }
  >
> = {
  [Chain.MAINNET]: {
    chainId: 1,
    name: "Ethereum",
    endpoint: "https://eth.blockscout.com/",
  },
  [Chain.BASE]: {
    chainId: 1,
    name: "Ethereum",
    endpoint: "https://eth.blockscout.com/",
  },
};

export const getChainConfigs = (chain: Chain) => {
  const config = chainConfigs[chain];
  if (!config) {
    throw new Error("Invalid chain");
  }
  return config;
};
