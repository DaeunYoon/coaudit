import { NextRequest, NextResponse } from "next/server";
import { Chain } from "@/lib/chains";
import { IndexService, SchemaItem, decodeOnChainData } from "@ethsign/sp-sdk";
import { schemaConfig } from "@/config";
import { Contract, ethers } from "ethers";
import bountyHookAbi from "@/lib/abi/bountyHook.json";
import { Abi, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

interface Params {
  chain: Chain;
  address: string;
}

export async function GET(_: NextRequest, context: { params: Params }) {
  const { address } = context.params;

  const indexService = new IndexService("testnet");
  const schemaInfo = schemaConfig[Chain.SEPOLIA];

  const res = await indexService.queryAttestationList({
    schemaId: schemaInfo.bountySchemaId,
    page: 1,
    mode: "onchain", // Data storage location
    indexingValue: address?.toLowerCase() ?? "",
  });

  const row = res?.rows[0];
  const dataType: SchemaItem[] | undefined = row?.schema?.data as SchemaItem[];

  if (!dataType || !res?.rows) {
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

  const data = [];

  for (const item of res.rows) {
    const amount = await publicClient.readContract({
      address: "0x69e4EEbc6176d8905B2BDd416e4E69Dc830c3d36" as `0x${string}`,
      abi: bountyHookAbi as Abi,
      functionName: "bountyIdToBalance",
      args: [row?.attestationId],
    });
    // const decoded = decodeOnChainData(res?.rows[0].data, 0, dataType);

    data.push({
      ...item,
      amount,
    });
  }

  console.log(data);
  return NextResponse.json({
    data: data,
    status: 200,
  });
}
