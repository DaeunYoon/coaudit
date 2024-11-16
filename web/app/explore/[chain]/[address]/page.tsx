"use client";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { usePathname } from "next/navigation";
import { baseUrl } from "@/utils/constants";
import formatFilePath from "@/components/organisms/monaco/utils/formatFilePath";
import CodeEditor from "@/components/organisms/monaco/CodeEditor";
import { ParsedInformation } from "@/types";
import Card from "@/components/atoms/card";
import { Chain, chains, getExplorerAddressUri } from "@/lib/chains";
import Link from "next/link";
import Button from "@/components/atoms/button";
import CreateBountyModal from "@/components/molecules/createBountyModal";
import CreateBugModal from "@/components/molecules/createBugModal";

export default function Explorer() {
  const pathname = usePathname();
  const chain = pathname.split("/")[2];
  const address = pathname.split("/")[3];

  function getEditorData(contractInfo: any[] | undefined) {
    if (!contractInfo) {
      return undefined;
    }

    return [
      ...contractInfo.map((source: any) => ({
        ...source,
        file_path: formatFilePath(source.contractPath || `index.sol`),
        source_code: source.sourceCode,
      })),
    ];
  }

  const { data: editorData, isLoading: isLoadingContract } = useQuery({
    queryKey: ["contract", chain, address],
    queryFn: async () => {
      try {
        const url = `${baseUrl}/api/contract/${chain}/${address}`;
        const { data: conractData } = await axios.get(url, {});
        const editorData = getEditorData(conractData.data);

        return editorData;
      } catch (e) {
        toast.error("Something went wrong fetching contract information.");
        console.error(e);
        return null;
      }
    },
    enabled: !!chain && !!address,
  });

  const { data: parsedData } = useQuery({
    queryKey: ["contract", "parse", chain, address],
    queryFn: async () => {
      const loadingToastId = toast.loading(
        "Fetching parsed data information...",
        {
          id: "parsedData",
        }
      );

      try {
        const url = `${baseUrl}/api/contract/parse/${chain}/${address}`;
        const { data: parsedData } = await axios.get(url, {});

        toast.success("Successfully fethced parsed function data!", {
          id: loadingToastId,
        });
        return (parsedData?.data || {}) as Record<string, ParsedInformation>;
      } catch (e) {
        toast.error("Something went wrong fetching parsed data information.", {
          id: loadingToastId,
        });
        console.error(e);
        return undefined;
      }
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!chain && !!address,
  });

  const { data: attestations } = useQuery({
    queryKey: ["contract", "status", chain, address],
    queryFn: async () => {
      const loadingToastId = toast.loading(
        "Fetching parsed data information...",
        {
          id: "parsedData",
        }
      );

      try {
        const url = `${baseUrl}/api/contract/index/${chain}/${address}`;
        const { data: attestations } = await axios.get(url, {});

        toast.success("Successfully fethced parsed function data!", {
          id: loadingToastId,
        });
        return (attestations?.data || []) as Record<string, ParsedInformation>;
      } catch (e) {
        toast.error("Something went wrong fetching parsed data information.", {
          id: loadingToastId,
        });
        console.error(e);
        return undefined;
      }
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!chain && !!address,
  });

  const formatHash = (
    hash: string,
    first: number = 4,
    last: number = 6
  ): string | undefined => {
    if (!hash) return;
    return `0x${hash.slice(2, first)}...${hash.slice(-last)}`;
  };

  return (
    <div className="w-[1200px] pt-32 pb-12 flex flex-col gap-8">
      <Card className={"bg-sidebar-background flex items-center"}>
        <div className="flex flex-col gap-2  w-[25%]">
          <h2 className="text-sm text-white">Chain</h2>
          <p className="text-white text-lg">
            {chains[Number(chain || 1) as Chain]?.name || chain}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-[25%]">
          <h2 className="text-sm text-white">Address</h2>
          <p className="text-white">
            <Link
              target={"_blank"}
              href={getExplorerAddressUri(Number(chain), address)}
              className="text-blue-300 text-xl"
            >
              {formatHash(address)}
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-2 w-[25%]">
          <h2 className="text-sm text-white">Total bounty Amount</h2>
          <p className="text-white text-xl">0 ETH</p>
        </div>

        <div className="flex flex-col gap-2 w-[25%]">
          <h2 className="text-sm text-white">Total bugs reported</h2>
          <p className="text-white text-xl">0</p>
        </div>

        <div className="flex flex-col gap-2 w-[25%]">
          <h2 className="text-sm text-white">Total payouts</h2>
          <p className="text-white text-xl">0 ETH</p>
        </div>
      </Card>

      <div className="flex gap-6">
        <Card className={"bg-sidebar-background flex gap-6"}>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl text-white mb-2">Bounties</h2>
            <p className="text-white">No bounties created</p>
            <Button
              className="py-0"
              onClick={() => {
                const modal: any = document.getElementById(
                  "create-bounty-modal"
                );
                modal?.showModal() as any;
              }}
            >
              Add a bounty
            </Button>
          </div>
        </Card>

        <Card className={"bg-sidebar-background flex gap-6"}>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl text-white mb-2">Bug reports</h2>
            <div className="text-white flex justify-center flex-col gap-3 w-full">
              <p className="text-white">No bugs submitted</p>
              <Button
                onClick={() => {
                  const modal: any =
                    document.getElementById("create-bug-modal");
                  modal?.showModal() as any;
                }}
              >
                Report a bug
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {isLoadingContract ? (
        <div className="h-[600px] w-full flex justify-center items-center bg-background-secondary">
          <span className="loading loading-spinner loading-lg text-white"></span>
        </div>
      ) : editorData ? (
        <CodeEditor
          chain={Number(chain || 1)}
          key={address}
          data={editorData}
          parsedData={parsedData}
          language="sol"
          mainFile={editorData[0]?.file_path}
        />
      ) : (
        <div className="h-[600px] w-full flex justify-center items-center bg-background-secondary">
          <h2 className="text-white">No internet connection :(</h2>
        </div>
      )}

      <CreateBountyModal contractAddress={address} chainId={chain} />
      <CreateBugModal contractAddress={address} chainId={chain} />
    </div>
  );
}
