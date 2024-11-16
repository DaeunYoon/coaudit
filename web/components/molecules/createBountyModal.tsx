"use client";

import { config } from "@/lib/chains";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Abi, isAddress, parseUnits } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { Input } from "../atoms/input";
import { useState } from "react";
import Button from "../atoms/button";
import { getPublicClient, getWalletClient } from "@wagmi/core";

export default function CreateBountyModal({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: string;
}) {
  const [bountyAmount, setBountyAmount] = useState("0");

  const { mutate: onCreate, isPending: isCreatingBounty } = useMutation({
    mutationFn: async () => {
      const toastId = toast.loading("Creating a bounty...");

      if (!contractAddress || !isAddress(contractAddress) || !chainId)
        return toast.error("Invalid parameters");

      if (typeof Number(bountyAmount) !== "number")
        return toast.error("Invalid bounty amount");

      try {
        const formattedAmount = parseUnits(bountyAmount, 18);
        console.log(config);
        const walletClient = await getWalletClient(config);
        console.log(walletClient);
        const [account] = await walletClient.getAddresses();
        const client = getPublicClient(config);
        if (!client) throw new Error("Error retrieving public client");

        const bountyArgs = {
          account,
          address: contractAddress as `0x${string}`,
          abi: {} as Abi, // TODO: Add ABI
          args: [chainId, contractAddress, formattedAmount], // TODO: Double check the args
          functionName: "withdraw",
          value: formattedAmount,
        };

        const { request } = await client.simulateContract(bountyArgs);
        const hash = await walletClient.writeContract(request);
        await waitForTransactionReceipt(walletClient, { hash });

        toast.success("Successfully created the bounty.", { id: toastId });
      } catch (error) {
        toast.error("Something went wrong while creating the bounty.", {
          id: toastId,
        });
        console.error(error);
      }
    },
  });

  return (
    <dialog id="create-bounty-modal" className="modal">
      <div className="modal-box text-white">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            disabled={isCreatingBounty}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Create a bug bounty</h3>

        <div className="flex flex-col gap-4">
          <Input
            type="number"
            min={0}
            placeholder="Enter reward amount"
            onChange={(e) => setBountyAmount(e.target.value)}
          />

          <Button
            className="btn"
            onClick={() => onCreate()}
            loading={isCreatingBounty}
          >
            Create a bounty
          </Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={isCreatingBounty}>close</button>
      </form>
    </dialog>
  );
}
