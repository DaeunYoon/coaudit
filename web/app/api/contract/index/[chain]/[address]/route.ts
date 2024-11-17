import { NextRequest, NextResponse } from 'next/server';
import { Chain } from '@/lib/chains';
import { IndexService, AttestationInfo } from '@ethsign/sp-sdk';
import { schemaConfig } from '@/config';
import bountyHookAbi from '@/lib/abi/bountyHook.json';
import { Abi, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

interface Params {
  chain: Chain;
  address: string;
}

export async function GET(_: NextRequest, context: { params: Params }) {
  const { address } = context.params;

  const indexService = new IndexService('testnet');
  const schemaInfo = schemaConfig[Chain.SEPOLIA];

  const res = await indexService.queryAttestationList({
    page: 1,
    mode: 'onchain', // Data storage location
    indexingValue: address?.toLowerCase() ?? '',
  });

  if (!res?.rows) {
    return NextResponse.json({
      data: [],
      status: 200,
    });
  }

  const url = process.env.SEPOLIA_RPC_URL;
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(url),
  });

  const data = {
    bounty: [] as (AttestationInfo & { amount: unknown })[],
    reports: [] as (AttestationInfo & {
      status?: AttestationInfo;
    })[],
  };

  for (const row of res.rows) {
    if (row.schemaId == schemaInfo.bountySchema) {
      const amount = await publicClient.readContract({
        address: '0x69e4EEbc6176d8905B2BDd416e4E69Dc830c3d36' as `0x${string}`,
        abi: bountyHookAbi as Abi,
        functionName: 'bountyIdToBalance',
        args: [row?.attestationId],
      });

      data.bounty.push({
        ...row,
        amount,
      });
    } else if (row.schemaId == schemaInfo.reportSchema) {
      data.reports.push(row);
    } else if (row.schemaId == schemaInfo.reportStatusSchema) {
      const findReportIndex = data.reports.findIndex(
        (report) => report.linkedAttestation == row.attestationId
      );
      data.reports[findReportIndex].status = row;
    }
  }

  return NextResponse.json({
    data,
    status: 200,
  });
}
