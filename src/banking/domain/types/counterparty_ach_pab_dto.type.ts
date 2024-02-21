import { CounterpartyStatus } from "../../../counterparty";
import { InstructionsAchPabType } from "./instructions_ach_pab.type";

export type CounterpartyAchPabDtoType = {
  id?: string;
  assetId: string;
  counterpartyId: string;
  counterpartyType: string;
  clientId: string;
  accountId: string;
  status: CounterpartyStatus;
  achInstructions: InstructionsAchPabType;
};
