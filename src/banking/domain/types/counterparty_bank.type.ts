import { Address } from "../../../shared";
import { NetworkBank } from "../enums/network_bank.enum";
import { InformationIntermediaryBankDTO } from "./information_intermediary_bank.type";
import { CounterpartyProfileType } from "../../../counterparty";

export type CounterpartyBankDTO = {
  id?: string;
  assetId: string;
  accountNumber: string;
  counterpartyId: string;
  counterpartyType: string;
  clientId: string;
  accountId: string;
  routingNumber?: string;
  swiftCode?: string;
  profileType: CounterpartyProfileType;
  iban?: string;
  informationOwner: { name: string; address: Address };
  informationBank: {
    bankName: string;
    networkBank: NetworkBank;
    address: Address;
  };
  informationIntermediaryBank?: InformationIntermediaryBankDTO;
};
