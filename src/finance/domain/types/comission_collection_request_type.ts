import { TypeFinancialMovement } from "../enums/type_financial_movement.enum";

export type ComissionCollectionRequestType = {
  withdrawalId: string;
  typeFinancialMovement: TypeFinancialMovement;
  transactionId: string;
  assetCode?: string;
};
