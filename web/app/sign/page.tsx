"use client";
import Header from "@components/header";
import Footer from "@components/footer";

import Connect from "@components/fil-frame/connect";
import ContractIntegration from "@/components/fil-frame/contractIntegration/contractIntegration";
import AccountDetails from "@/components/fil-frame/accountDetails/showAccountDetails";
import { useAccount, useBalance } from "wagmi";
import SignData from "@/components/fil-frame/signData/signMessage";
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
    <div className="w-full min-h-screen bg-blue-600 absolute">
      <Header />
      <div className="flex flex-col justify-center items-center relative gap-8 pt-24 lg:pt-30 pb-10 lg:pb-40 w-full">
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
      </div>

      <Footer />
    </div>
  );
}
