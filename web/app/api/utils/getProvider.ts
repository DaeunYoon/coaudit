import { getDefaultProvider } from 'ethers';
import type { SupportedChain } from '@/types';

const CHAIN_IDS: Record<SupportedChain, string> = {
  ethereum: 'homestead',
};

export default (chain: SupportedChain) => {
  return getDefaultProvider(CHAIN_IDS[chain]);
};
