import { NextRequest, NextResponse } from 'next/server';
import getParsedContract from '@/utils/getParsedContract';
import getContractInfo from '@/utils/getContractInfo';
import { SupportedChain, ParsedInformation, Contract } from '@/types';

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

  const ret: Record<string, ParsedInformation> = {};
  for (const contractInfo of contracts) {
    const parsedInfo = await getParsedContract(contractInfo);
    ret[contractInfo.contractPath] = parsedInfo;
  }

  return NextResponse.json({
    data: ret,
    status: 200,
  });
}
