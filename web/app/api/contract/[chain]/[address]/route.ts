import { NextRequest, NextResponse } from "next/server";
import getContractInfo from "@/app/api/utils/getContractInfo";
import { Contract } from "@/types";
import { Chain } from "@/lib/chains";

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

  return NextResponse.json({
    data: contracts,
    status: 200,
  });
}
