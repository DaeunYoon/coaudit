import { Interface } from "ethers/lib/utils";
import getContractInfo from "./getContractInfo";
import { Chain } from "@/lib/chains";

const getAbi = async (address: string, chain: Chain, functionName: string) => {
  const { abi } = (await getContractInfo(address, chain))[0];
  if (!abi) {
    return null;
  }
  for (const [nameFull, func] of Object.entries(new Interface(abi).functions)) {
    const name = nameFull.split("(")[0];
    if (name !== functionName) {
      continue;
    }

    const retTypes = func.outputs?.map((o) => o.type);
    if (retTypes?.length !== 1) {
      return;
    }
    const retType = retTypes[0];
    if (retType === "address") {
      return abi;
    }
  }

  return;
};

export default getAbi;
