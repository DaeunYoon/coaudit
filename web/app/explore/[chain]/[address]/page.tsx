"use client";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { usePathname } from "next/navigation";
import { baseUrl } from "@/utils/constants";
import formatFilePath from "@/components/organisms/monaco/utils/formatFilePath";
import CodeEditor from "@/components/organisms/monaco/CodeEditor";

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
        const { data } = await axios.get(url, {});

        const editorData = getEditorData(data.data);
        console.log(editorData);

        return editorData;
      } catch (e) {
        toast.error("Something went wrong fetching contract information.");
        console.error(e);
        return null;
      }
    },
    enabled: !!chain && !!address,
  });

  return (
    <div className="w-[1200px]">
      <div className="text-white">Contract info here:</div>
      <div className="text-white">Chain: {chain}</div>
      <div className="text-white mb-8">Address: {address}</div>

      {editorData ? (
        <CodeEditor
          key={address}
          data={editorData}
          // remappings={editorData?.compiler_settings?.remappings}
          // libraries={editorData?.external_libraries ?? undefined}
          // language={editorData?.language ?? undefined}
          mainFile={editorData[0]?.file_path}
          contractName={"Contract Name"}
        />
      ) : (
        "Loading..."
      )}
    </div>
  );
}
