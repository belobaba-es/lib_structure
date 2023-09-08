import { TypeBankDetails } from "../../../banking/domain/enums/type_bank_details.enum";
import { Address } from "../../../shared";
import { OriginWallet } from "../../../wallet";
import { IClient } from "../../../client";
import { CounterpartyType } from "../enums/counterparty_type.enum";
import { NetworkBank } from "../../../banking";

export type CounterpartyFactoryDTO = {
  type: CounterpartyType;
  client: IClient;
  informationOwner: {
    name: string;
    address: {
      streetOne?: string;
      streetTwo?: string;
      postalCode?: string;
      city?: string;
      region?: string;
      country: string;
    };
  };
  informationBank?: {
    accountNumber: string;
    swiftCodeOrRoutingNumber: string;
    // type: TypeBankDetails;
    bankName: string;
    networkBank: NetworkBank;
    address: Address;
  };
  informationWallet?: {
    assetId: string;
    address: string;
    originWallet: OriginWallet;
    institutionName?: string;
    institutionAddress?: Address;
  };
};
