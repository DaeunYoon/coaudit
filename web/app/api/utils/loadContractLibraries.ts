import { SupportedChain } from '@/types';
import getContractInfo from './getContractInfo';

export default async function loadContractLibraries(
  address: string,
  chain: SupportedChain
) {
  try {
    const contract = await getContractInfo(address, chain);

    if (contract[0].library === '') return {};
    const libraries = contract[0].library.split(';');
    const ret = Object.fromEntries(
      libraries.map((l) => {
        const [key, val] = l.split(':');
        return [key, `0x${val}`];
      })
    );
    await Promise.all(
      Object.values(ret).map(async (v) => {
        return loadContractLibraries(v, chain);
      })
    );
    return ret;
  } catch (error) {
    throw new Error('Contract not found');
  }
}
