"use client";
import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import Connect from "@/components/organisms/connect";
import ContractIntegration from "@/components/organisms/contractIntegration/contractIntegration";
import AccountDetails from "@/components/organisms/accountDetails/showAccountDetails";
import { useAccount, useBalance } from "wagmi";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Defi() {
  // Dynamic hooks
  const { sdkHasLoaded } = useDynamicContext();

  // WAGMI hooks
  const { address, isConnected } = useAccount();

  const { data } = useBalance({
    address: address,
  });

  const [isCopied, setIsCopied] = useState(false);

  const textToCopy = address;
  const displayText = `${textToCopy?.slice(0, 6)}...${textToCopy?.slice(-6)}`;

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      });
    }
  };

  return (
    <>
      {sdkHasLoaded && isConnected && address ? (
        <div className="flex flex-col gap-8">
          {data?.value == BigInt(0) ? (
            <>
              <div className="flex flex-col border-2 border-black overflow-hidden p-8 rounded-xl shadow-large bg-yellow-300 w-full">
                <div className="px-2 py-8 sm:p-10 sm:pb-6">
                  <div className="items-center w-full justify-center grid grid-cols-1 text-center">
                    <div className="flex flex-row justify-center">
                      <h2 className="text-black text-lg lg:text-xl">
                        Hello, {displayText}
                      </h2>
                      <FaCopy
                        className="flex cursor-pointer text-gray-500 hover:text-gray-700"
                        onClick={handleCopy}
                      />
                      {isCopied && (
                        <span className="text-sm text-red-500">Copied!</span>
                      )}
                    </div>

                    <a
                      href="https://faucet.calibnet.chainsafe-fil.io/"
                      target="_blank"
                    >
                      <h2 className="text-black font-bold text-lg lg:text-3xl mt-4">
                        GET TEST FILECOIN TOKENS
                      </h2>
                    </a>
                  </div>
                </div>
                <div className="flex flex-col flex-1 cursor-pointer justify-between pb-8 space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="https://faucet.calibnet.chainsafe-fil.io/"
                      target="_blank"
                      className="text-black items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-xl shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-4 lg:text-4xl px-4 py-2"
                    >
                      <button>Open Filecoin Calibration Faucet</button>
                    </a>
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={`https://calibration.filfox.info/en/address/${displayText}`}
                    >
                      <h2 className="text-black text-sm">
                        View Account On Explorer
                      </h2>
                    </a>

                    <h2 className="text-black text-sm">
                      Refresh once the funds are received
                    </h2>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <AccountDetails />
              </div>
              <div>
                <ContractIntegration
                  account={address}
                  balance={data?.formatted}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <Connect />
        </>
      )}
    </>
  );
}
