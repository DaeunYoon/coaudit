import { NextRequest, NextResponse } from 'next/server';
import getContractInfo from '@/app/api/utils/getContractInfo';
import { SupportedChain, Contract } from '@/types';

interface Params {
  chain: SupportedChain;
  address: string;
}

export async function GET(_: NextRequest, context: { params: Params }) {
  const { address, chain } = context.params;
  const contracts: Contract[] | Error = await getContractInfo(
    address,
    chain as SupportedChain
  );

  if (contracts instanceof Error) {
    return NextResponse.json({
      error: contracts.message,
      status: 500,
    });
  }

  return NextResponse.json({
    data: contracts,
    status: 200,
  });
}
