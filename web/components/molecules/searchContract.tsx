"use client";

import Button from "@/components/atoms/button";

import { Chain } from "@/lib/chains";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/dist/client/components/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { isAddress } from "viem";
import Select, { SelectOption } from "../atoms/select";
import { Input } from "../atoms/input";

const chainDropwdown: SelectOption[] = [
  { label: "ETH Mainnet", value: Chain.MAINNET },
  { label: "Base", value: Chain.BASE },
];

export default function SearchContract() {
  const [contractAddress, setContractAddress] = useState("");
  const [chain, setChain] = useState(Chain.MAINNET.toString());

  const router = useRouter();

  const { mutate: onSearch, isPending: isSearching } = useMutation({
    mutationFn: async () => {
      try {
        if (!contractAddress || !isAddress(contractAddress))
          return toast.error("Please enter a valid contract address.");

        console.log(chain);
        if (!chain) return toast.error("Please select a chain.");

        router.push(`/explore/${chain}/${contractAddress}`);
      } catch (error) {
        toast.error("Something went wrong while unwrapping.");
        console.error(error);
      }
    },
  });

  return (
    <>
      <div>
        <Select
          options={chainDropwdown}
          title="Chain"
          onClick={(value: string) => setChain(value)}
          value={chain}
        ></Select>
      </div>
      <div className="w-[350px]">
        <Input
          placeholder="Search"
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>

      <Button onClick={() => onSearch()} className="" loading={isSearching}>
        View contract
      </Button>
    </>
  );
}
