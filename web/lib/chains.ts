export enum Chain {
  MAINNET = 1,
  BASE = 8453,
}

export const chains: Record<Chain, any> = {
  [Chain.MAINNET]: {
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  [Chain.BASE]: {
    chainId: "0x2102",
    chainName: "Base",
    nativeCurrency: {
      name: "Base",
      symbol: "BASE",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.basechain.net"],
    blockExplorerUrls: ["https://explorer.basechain.net"],
  },
};
