"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { filecoin, filecoinCalibration } from "viem/chains";
import {
  DynamicContextProvider,
  mergeNetworks,
  OnAuthSuccess,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { createConfig, WagmiProvider } from "wagmi";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/loadingPage";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [filecoin, filecoinCalibration],
  transports: {
    [filecoin.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export const myEvmNetworks = [
  {
    chainId: 314159,
    networkId: 314159,
    iconUrls: [""],
    name: "Filecoin Calibration",
    nativeCurrency: {
      decimals: 18,
      name: "FIL",
      symbol: "FIL",
    },
    rpcUrls: ["https://api.calibration.node.glif.io/rpc/v1"],
    blockExplorerUrls: ["https://calibration.filfox.info/en"],
  },
];

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const onAuthSuccess: OnAuthSuccess = async (args) => {
    const dynamicUserId = args.user.userId;

    setIsLoading(true);

    if (dynamicUserId) {
      router.push("/explore");
    } else {
      router.push("/");
    }

    setIsLoading(false);
  };

  const onLogout = async () => {
    setIsLoading(true);

    router.push("/");

    setIsLoading(false);
  };

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => mergeNetworks(myEvmNetworks, networks),
        },
        eventsCallbacks: {
          onAuthSuccess,
          onLogout,
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {isLoading ? <LoadingPage /> : children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
