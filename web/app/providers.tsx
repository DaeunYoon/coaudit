'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {defineChain, http} from 'viem';
import {filecoin, filecoinCalibration} from 'viem/chains';
import { DynamicContextProvider, mergeNetworks } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { createConfig, WagmiProvider } from 'wagmi';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [filecoin, filecoinCalibration],
  transports: {
    [filecoin.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export const myEvmNetworks = [{
  chainId: 314159,
  networkId: 314159,
  iconUrls: [''],
  name: "Filecoin Calibration",
  nativeCurrency:{
    decimals: 18,
    name: 'FIL',
    symbol: 'FIL'
  },
  rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
  blockExplorerUrls: ['https://calibration.filfox.info/en']
}]

export default function Providers({children}: {children: React.ReactNode}) {
  return (
      <DynamicContextProvider
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: (networks) => mergeNetworks(myEvmNetworks, networks),
        }
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>
            {children}
            </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
 