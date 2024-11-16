import { NextRequest, NextResponse } from 'next/server';
import getParsedContract from '@/app/api/utils/getParsedContract';
import getContractInfo from '@/app/api/utils/getContractInfo';
import { ParsedInformation, Contract } from '@/types';
import { Chain } from '@/lib/chains';

interface Params {
  chain: Chain;
  address: string;
}

export async function GET(_: NextRequest, context: { params: Params }) {
  const { address, chain } = context.params;
  const contracts: Contract[] | Error = await getContractInfo(
    address,
    Number(chain) as Chain
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
    ret[contractInfo.contractName] = parsedInfo;
  }

  return NextResponse.json({
    data: ret,
    status: 200,
  });
}
