import { createConfig } from "wagmi";
import { Chain as ViemChain, http } from "viem";
import { base, mainnet, sepolia } from "viem/chains";

export enum Chain {
  MAINNET = 1,
  BASE = 8453,
  SEPOLIA = 11155111,
}

export const chains: readonly [ViemChain, ...ViemChain[]] = [base, mainnet];

export const ChainSettings: Record<
  Chain,
  {
    name: string;
    color: string;
  }
> = {
  [Chain.MAINNET]: {
    name: "ETH Mainnet",
    color: "#fff",
  },
  [Chain.BASE]: {
    name: "Base",
    color: "#3372fa",
  },
  [Chain.SEPOLIA]: {
    name: "Sepolia",
    color: "#fff",
  },
};

export const config = createConfig({
  chains,
  transports: {
    // [mainnet.id]: http(),
    [sepolia.id]: http(),
    // [base.id]: http(),
  },
  connectors: [],
});

export const getExplorerTransactionUri = (chainId: number, address: string) => {
  return `${
    chains.find(({ id }) => id === chainId)?.blockExplorers?.default.url
  }/tx/${address}`;
};

export const getExplorerAddressUri = (chainId: number, address: string) => {
  return `${
    chains.find(({ id }) => id === chainId)?.blockExplorers?.default.url
  }/address/${address}`;
};
