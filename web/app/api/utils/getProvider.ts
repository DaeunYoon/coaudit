import { Chain } from "@/lib/chains";
import { getDefaultProvider } from "ethers";

export default (chain: Chain) => {
  return getDefaultProvider(chain);
};
