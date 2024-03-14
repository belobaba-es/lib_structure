import { Address, GenericException } from "../../shared";
import { NetworkBank } from "./enums/network_bank.enum";
import { Counterparty, CounterpartyStatus } from "../../counterparty";
import { CounterpartyBankDTO } from "./types/counterparty_bank.type";
import { InformationIntermediaryBankDTO } from "./types/information_intermediary_bank.type";

export class CounterpartyBank extends Counterparty {
  private ownerAddress: Address;

  private accountNumber: string;
  private routingNumber?: string;
  private swiftCode?: string;
  private iban?: string;
  private bankName: string;
  private bankAddress: Address;
  private networkBank: NetworkBank;
  private informationIntermediaryBank?: InformationIntermediaryBankDTO;

  static newCounterparty(
    counterpartyBank: CounterpartyBankDTO,
    status: CounterpartyStatus,
    isInternal: boolean = false,
  ): CounterpartyBank {
    const c: CounterpartyBank = new CounterpartyBank();

    c.assetId = counterpartyBank.assetId;

    c.clientId = counterpartyBank.clientId;
    c.accountId = counterpartyBank.accountId;
    c.setOwnerName(counterpartyBank.informationOwner.name);
    c.ownerAddress = counterpartyBank.informationOwner.address;
    c.accountNumber = counterpartyBank.accountNumber;

    c.profileType = counterpartyBank.profileType;

    c.counterpartyType = counterpartyBank.counterpartyType;
    c.isInternal = isInternal;

    c.counterpartyId = counterpartyBank.counterpartyId;

    c.status = status;

    if (
      counterpartyBank.informationBank.networkBank === NetworkBank.WIRE ||
      counterpartyBank.informationBank.networkBank === NetworkBank.ACH
    ) {
      c.routingNumber = counterpartyBank.routingNumber;
      if (counterpartyBank.routingNumber === undefined) {
        throw new GenericException("The field routing Number is mandatory");
      }
    } else {
      if (
        counterpartyBank.swiftCode === undefined &&
        counterpartyBank.iban === undefined
      ) {
        throw new GenericException(
          "The fields swiftCode or IBAN are mandatory",
        );
      }
      c.swiftCode = counterpartyBank.swiftCode;
      c.iban = counterpartyBank.iban;
    }

    c.networkBank = counterpartyBank.informationBank.networkBank;
    c.bankAddress = counterpartyBank.informationBank.address;
    c.bankName = counterpartyBank.informationBank.bankName;
    c.createdAt = new Date();

    if (counterpartyBank.informationIntermediaryBank) {
      c.informationIntermediaryBank = {
        ...counterpartyBank.informationIntermediaryBank,
      };
    }

    return c;
  }

  static fromPrimitives(id: string, data: any): CounterpartyBank {
    const counterparty: CounterpartyBank = new CounterpartyBank();
    counterparty.id = id;

    const informationOwner = data.informationOwner;
    const informationBank = data.informationBank;
    counterparty.assetId = data.assetId;

    counterparty.counterpartyId = data.counterpartyId;
    counterparty.ownerName = informationOwner.name;
    counterparty.ownerAddress = { ...informationOwner.address } as Address;
    counterparty.accountNumber = data.accountNumber;
    counterparty.routingNumber = data.routingNumber ?? undefined;
    counterparty.swiftCode = data.swiftCode ?? undefined;
    counterparty.bankAddress = { ...informationBank.address } as Address;

    if ("informationIntermediaryBank" in data) {
      counterparty.informationIntermediaryBank = {
        ...data.informationIntermediaryBank,
      };
    }
    counterparty.iban = data.iban ?? "";

    counterparty.profileType = data.profileType ?? "";

    counterparty.bankName = informationBank.bankName;
    counterparty.accountNumber = informationBank.accountNumber;
    counterparty.networkBank = informationBank.networkBank;

    counterparty.clientId = data.clientId;
    counterparty.accountId = data.accountId;
    counterparty.counterpartyType = data.counterpartyType;
    counterparty.createdAt = data.createdAt;
    counterparty.isInternal = data.isInternal === "S";

    counterparty.status = data.status;

    return counterparty;
  }

  getSwiftCode(): string | undefined {
    return this.swiftCode;
  }

  getIban(): string {
    return this.iban;
  }

  getRoutingNumber(): string | undefined {
    return this.routingNumber;
  }

  getAccountNumber(): string {
    return this.accountNumber;
  }

  getInformationBank(): {
    accountNumber: string;
    routingNumber: string | undefined;
    bankName: string;
    networkBank: NetworkBank;
    address: Address;
  } {
    return {
      accountNumber: this.accountNumber,
      bankName: this.bankName,
      networkBank: this.networkBank,
      address: this.bankAddress,
      routingNumber: this.routingNumber,
    };
  }

  getInformationOwner(): { name: string; address: Address } {
    return {
      name: this.ownerName,
      address: this.ownerAddress,
    };
  }

  getName() {
    return this.ownerName;
  }

  getInformationIntermediaryBank(): InformationIntermediaryBankDTO {
    return this.informationIntermediaryBank;
  }

  toPrimitives(): any {
    return {
      id: this.id,
      assetId: this.assetId,
      clientId: this.clientId,
      counterpartyId: this.counterpartyId,
      counterpartyType: this.counterpartyType,
      accountId: this.accountId,
      swiftCode: this.swiftCode,
      iban: this.iban,
      informationOwner: this.getInformationOwner(),
      informationBank: this.getInformationBank(),
      informationIntermediaryBank: this.getInformationIntermediaryBank(),
      isInternal: this.isInternal === true ? "S" : "N",
      profileType: this.profileType,
      createdAt: this.createdAt,
      status: this.status,
    };
  }
}
