'use client';

import { Chain, config } from '@/lib/chains';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Abi, isAddress, parseUnits } from 'viem';
import { Input } from '../atoms/input';
import { useState } from 'react';
import Button from '../atoms/button';

import { SignProtocolClient, SpMode, EvmChains } from '@ethsign/sp-sdk';
import { schemaConfig } from '@/config';

export default function CreateBountyModal({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: string;
}) {
  const [bountyAmount, setBountyAmount] = useState('0');
  const [result, handleResult] = useState('');

  const { mutate: onCreate, isPending: isCreatingBounty } = useMutation({
    mutationFn: async () => {
      const toastId = toast.loading('Creating a bounty...');

      if (!contractAddress || !isAddress(contractAddress) || !chainId)
        return toast.error('Invalid parameters');

      if (typeof Number(bountyAmount) !== 'number')
        return toast.error('Invalid bounty amount');

      try {
        const formattedAmount = parseUnits(bountyAmount, 18);

        const client = new SignProtocolClient(SpMode.OnChain, {
          chain: EvmChains.sepolia,
        });

        const schemaInfo = schemaConfig[Chain.SEPOLIA];

        const res = await client.createAttestation(
          {
            schemaId: schemaInfo.bountySchema,
            data: {
              contractAddress,
              chainId: Number(chainId),
              title: 'Create a bounty',
            },
            indexingValue: contractAddress?.toLowerCase() ?? '',
          },
          {
            resolverFeesETH: formattedAmount,
          }
        );
        handleResult(JSON.stringify(res));

        toast.success('Successfully created the bounty.', { id: toastId });
      } catch (error) {
        toast.error('Something went wrong while creating the bounty.', {
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

        <p className="break-all">{result}</p>

        <div className="flex flex-col gap-4">
          <Input
            type="number"
            min={0}
            placeholder="Enter reward amount"
            className="!text-white"
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
