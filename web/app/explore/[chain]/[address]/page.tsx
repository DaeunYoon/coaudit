"use client";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { usePathname } from "next/navigation";
import { baseUrl } from "@/utils/constants";
import formatFilePath from "@/components/organisms/monaco/utils/formatFilePath";
import CodeEditor from "@/components/organisms/monaco/CodeEditor";
import { ParsedInformation } from "@/types";

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
        return (parsedData?.data || []) as ParsedInformation[];
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

  return (
    <div className="w-[1200px] pt-32 pb-12">
      <div className="text-white">Chain: {chain}</div>
      <div className="text-white mb-8">Address: {address}</div>

      {isLoadingContract ? (
        <div className="h-[600px] w-[1200px] flex justify-center items-center bg-background-secondary">
          <span className="loading loading-spinner loading-lg text-white"></span>
        </div>
      ) : editorData ? (
        <CodeEditor
          key={address}
          data={editorData}
          parsedData={parsedData}
          language="solidity"
          mainFile={editorData[0]?.file_path}
        />
      ) : (
        ""
      )}
    </div>
  );
}
