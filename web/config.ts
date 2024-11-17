import { Chain } from "./lib/chains";

export const schemaConfig: Record<
  any,
  {
    auditManager: string;
    bountySchema: string;
    bountySchemaId: string;
    bountySchemaIdHex: string;
    reportSchema: string;
    reportStatusSchema: string;
  }
> = {
  [Chain.SEPOLIA]: {
    auditManager: "0xe11F0559D147408F1B9b2fEd92C7e3126610A322",
    bountySchema: "785",
    bountySchemaId: "onchain_evm_11155111_0x311",
    bountySchemaIdHex: "0x311",
    reportSchema: "786",
    reportStatusSchema: "787",
  },
};
