"use client";

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { usePathname } from "next/navigation";
import { baseUrl } from "@/utils/constants";

export default function Explorer() {
  const pathname = usePathname();
  const chain = pathname.split("/")[2];
  const address = pathname.split("/")[3];

  const { data, isLoading: isLoadingContract } = useQuery({
    queryKey: ["contract", chain, address],
    queryFn: async () => {
      try {
        const url = `${baseUrl}/api/contract/${chain}/${address}`;
        const { data } = await axios.get(url, {});

        console.log(data);

        return data;
      } catch (e) {
        toast.error("Something went wrong fetching contract information.");
        console.error(e);
        return null;
      }
    },
    enabled: !!chain && !!address,
  });

  return (
    <div>
      <div className="text-white">Contract info here:</div>
      <div className="text-white">Chain: {chain}</div>
      <div className="text-white">Address: {address}</div>
    </div>
  );
}
