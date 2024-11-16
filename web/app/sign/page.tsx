"use client";
import Header from "@components/header";
import Footer from "@components/footer";

import Connect from "@/components/organisms/connect";
import ContractIntegration from "@/components/organisms/contractIntegration/contractIntegration";
import AccountDetails from "@/components/organisms/accountDetails/showAccountDetails";
import { useAccount, useBalance } from "wagmi";
import SignData from "@/components/organisms/signData/signMessage";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Sign() {
  // Dynamic hooks
  const { sdkHasLoaded } = useDynamicContext();

  // WAGMI hooks
  const { address, isConnected } = useAccount();

  const { data } = useBalance({
    address: address,
  });

  return (
    <>
      {sdkHasLoaded && isConnected && address ? (
        <div className="flex flex-col gap-8">
          <div>
            {/* <ContractIntegration
                account={address}
                balance={data?.formatted}
              /> */}
          </div>
          <div>
            <SignData />
          </div>
        </div>
      ) : (
        <>
          <Connect />
        </>
      )}
    </>
  );
}
