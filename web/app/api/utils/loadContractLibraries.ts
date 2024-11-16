import { Chain } from "@/lib/chains";
import getContractInfo from "./getContractInfo";

export default async function loadContractLibraries(
  address: string,
  chain: Chain
) {
  try {
    const contracts = await getContractInfo(address, chain);
    if (contracts[0].libraries?.length === 0) return {};
    const libraries = contracts[0].libraries.map((l) => [
      l.name,
      l.addressHash,
    ]);
    const ret = Object.fromEntries(libraries);
    await Promise.all(
      Object.values(ret).map(async (v: any) => {
        return loadContractLibraries(v, chain);
      })
    );

    return ret;
  } catch (error) {
    throw new Error("Contract not found");
  }
}
