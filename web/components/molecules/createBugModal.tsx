'use client';

import { Chain, config } from '@/lib/chains';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAddress, parseUnits } from 'viem';
import { Input } from '../atoms/input';
import { useState } from 'react';
import Button from '../atoms/button';

import { SignProtocolClient, SpMode, EvmChains } from '@ethsign/sp-sdk';
import { schemaConfig } from '@/config';

export default function CreateBugModal({
  contractAddress,
  chainId,
  bountyId,
}: {
  contractAddress: string;
  chainId: string;
  bountyId: string;
}) {
  const [bugText, setBugText] = useState('');
  const [result, handleResult] = useState('');

  const { mutate: isReporting, isPending: isCreatingBounty } = useMutation({
    mutationFn: async () => {
      const toastId = toast.loading('Creating a bug...');

      if (!contractAddress || !isAddress(contractAddress) || !chainId)
        return toast.error('Invalid parameters');

      try {
        const client = new SignProtocolClient(SpMode.OnChain, {
          chain: EvmChains.sepolia,
        });

        const schemaInfo = schemaConfig[Chain.SEPOLIA];

        const res = await client.createAttestation({
          schemaId: schemaInfo.reportSchema,
          linkedAttestationId: '0x420',
          data: {
            finding: bugText,
          },
          indexingValue: contractAddress?.toLowerCase() ?? '',
        });
        handleResult(JSON.stringify(res));

        toast.success('Successfully created bug report.', { id: toastId });
      } catch (error) {
        toast.error('Something went wrong while creating bug report.', {
          id: toastId,
        });
        console.error(error);
      }
    },
  });

  return (
    <dialog id="create-bug-modal" className="modal">
      <div className="modal-box text-white">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            disabled={isCreatingBounty}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Create a bug</h3>

        <p className="break-all">{result}</p>

        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter description"
            className="!text-white"
            onChange={(e) => setBugText(e.target.value)}
          />

          <Button
            className="btn"
            onClick={() => isReporting()}
            loading={isCreatingBounty}
          >
            Report a bug
          </Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={isCreatingBounty}>close</button>
      </form>
    </dialog>
  );
}
