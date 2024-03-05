import { IClient } from "./interfaces/client.interface";
import { AggregateRoot } from "../../shared/domain/aggregate_root";
import {
  AccountStatus,
  AccountType,
  IAccount,
  IOwnerAccount,
} from "../../account";
import { CompanyDTO } from "./types/company.type";
import { IndividualDTO } from "./types/Individual.type";
import {
  Address,
  ContactInformation,
  GenericException,
  removeAccents,
} from "../../shared";
import { InvalidMethodForClientType } from "./exceptions/invalid_method_client_type";
import { ResidencyStatus } from "./enums/residency_status";
import { FeeACHPanama, FeeSwap, FeeWire } from "../../system_configuration";
import { Documents } from "../../documents";
import { KycAction } from "./types/kyc-action.type";
import { InvestmentProfile } from "./types/investment-profile.type";
import { KycProfileType } from "./types/kyc-profile.type";

export class Client extends AggregateRoot implements IClient {
  private clientId: string;
  private clientData: any;
  private clientType: AccountType;
  private account: IAccount;
  private id?: string;
  private isSegregated?: boolean;
  private kycRequestedChanges?: KycAction[];
  private accountId: string;
  private taxId?: string;
  private status: AccountStatus;
  private feeSwap?: FeeSwap;
  private feeWire?: FeeWire;
  private feeACHPanama?: FeeACHPanama;
  private documents: Documents[] = [];
  private companyPartners: IOwnerAccount[] = [];
  private twoFactorActive: boolean = false;
  private createdAt: Date;
  private approvedAt: Date;

  getId(): string {
    return this.id;
  }

  setStatus(clientStatus: AccountStatus): Client {
    this.status = clientStatus;
    return this;
  }

  setTaxId(taxId?: string): Client {
    this.taxId = taxId;
    return this;
  }

  setClientId(clientId: string): Client {
    this.clientId = clientId;
    return this;
  }

  setId(id: string): Client {
    this.id = id;
    return this;
  }

  setAccount(account: IAccount): Client {
    this.account = account;
    this.accountId = account.getAccountId();
    return this;
  }

  setFeeWire(fee: FeeWire): Client {
    this.feeWire = fee;
    return this;
  }

  setFeeSwap(fee: FeeSwap): Client {
    this.feeSwap = fee;
    return this;
  }

  setFeeACHPanama(fee: FeeACHPanama) {
    this.feeACHPanama = fee;
    return this;
  }

  setClientData(data: any): Client {
    this.clientData = data;
    this.createdAt = data.createdAt;
    this.approvedAt = data.approvedAt;

    return this;
  }

  setDocument(dni: string, document: Documents): Client {
    if (dni === this.getIDNumber()) {
      if (this.documents && this.documents.length > 0) {
        this.documents.push(document);
      } else {
        this.documents = [document];
      }

      return;
    }

    if (!this.companyPartners || this.companyPartners.length === 0) {
      throw new GenericException("Company partners not found");
    }

    this.companyPartners.forEach((p: IOwnerAccount) => {
      if (p.getIdentifyNumber() === dni) {
        p.setDocument(document);
      }
    });
    return this;
  }

  setClientType(clientType: AccountType): Client {
    this.clientType = clientType;
    return this;
  }

  setCompanyPartners(partners: IOwnerAccount[]): Client {
    this.companyPartners = partners;
    return this;
  }

  getCompanyPartners(): IndividualDTO[] | undefined {
    if (this.clientType === AccountType.INDIVIDUAL) {
      throw new InvalidMethodForClientType(
        this.clientType,
        "getCompanyToPrimitives",
      );
    }

    return this.clientData.partners;
  }

  setCreatedAt(date: Date): Client {
    this.createdAt = date;
    return this;
  }

  setApprovedAt(date: Date): Client {
    this.approvedAt = date;
    return this;
  }

  getTaxId(): string {
    return this.taxId;
  }

  getStatus(): AccountStatus {
    return this.status;
  }

  getAccount(): IAccount {
    return this.account;
  }

  build(): void {
    if (this.clientType == AccountType.COMPANY) {
      this.clientId =
        this.clientData.informationCompany.name.replace(" ", "-") +
        this.clientData.informationCompany.registerNumber;
    } else {
      this.clientId =
        this.clientData.firstName.substring(0, 1) +
        this.clientData.lastName.replace(" ", "-") +
        this.clientData.dni;
    }

    this.clientId = removeAccents(this.clientId).replace(/\s/g, "-");
  }

  getCompanyToPrimitives(): CompanyDTO {
    if (this.clientType === AccountType.INDIVIDUAL) {
      throw new InvalidMethodForClientType(
        this.clientType,
        "getCompanyToPrimitives",
      );
    }
    return this.clientData as CompanyDTO;
  }

  getNaics(): { code: string; description: string } {
    if (this.clientType === AccountType.INDIVIDUAL) {
      throw new InvalidMethodForClientType(this.clientType, "getNaics");
    }
    return {
      code: this.clientData.naics,
      description: this.clientData.naicsDescription,
    };
  }

  getEstablishedDate(): Date {
    if (this.clientType === AccountType.INDIVIDUAL) {
      throw new InvalidMethodForClientType(
        this.clientType,
        "getEstablishedDate",
      );
    }
    return this.clientData.established_date;
  }

  getWebSite(): string {
    if (this.clientType === AccountType.INDIVIDUAL) {
      throw new InvalidMethodForClientType(this.clientType, "getWebSite");
    }
    return this.clientData.webSite;
  }

  getClientId(): string {
    return this.clientId;
  }

  getClientType(): AccountType {
    return this.clientType;
  }

  getName(): string {
    if (this.clientType == AccountType.INDIVIDUAL) {
      return (
        this.clientData.firstName +
        " " +
        this.clientData.middleName +
        " " +
        this.clientData.lastName
      );
    }

    return this.clientData.informationCompany.name;
  }

  getEmail(): string {
    return this.clientData.email;
  }

  getIDNumber(): string {
    if (this.clientType === AccountType.COMPANY) {
      return (this.toPrimitives() as CompanyDTO).informationCompany
        .registerNumber;
    } else {
      return (this.toPrimitives() as IndividualDTO).dni;
    }
  }

  getAddress(): Address {
    const d = this.toPrimitives();
    if (this.clientType === AccountType.COMPANY) {
      return (this.toPrimitives() as CompanyDTO).informationCompany
        .physicalAddress;
    }

    return {
      streetOne: d.streetOne,
      streetTwo: d.streetTwo,
      postalCode: d.postalCode,
      city: d.city,
      region: d.region,
      country: d.country,
    };
  }

  getContactInformation(): ContactInformation {
    const d = this.toPrimitives();

    return {
      phoneCountry: d.phoneCountry,
      phoneNumber: d.phoneNumber,
      email: d.email,
    };
  }

  getPassportNumber(): string {
    if (this.clientType === AccountType.COMPANY) {
      throw new InvalidMethodForClientType(
        this.clientType,
        "getPassportNumber",
      );
    }
    return this.clientData.passport;
  }

  getDateOfBirth(): Date {
    if (this.clientType === AccountType.COMPANY) {
      throw new InvalidMethodForClientType(this.clientType, "getDateOfBirth");
    }

    return this.clientData.dateBirth;
  }

  getResidencyStatus(): ResidencyStatus {
    if (this.clientType === AccountType.COMPANY) {
      throw new InvalidMethodForClientType(
        this.clientType,
        "getResidencyStatus",
      );
    }

    return this.clientData.residencyStatus;
  }

  getFeeSwap(): FeeSwap {
    return this.feeSwap;
  }

  getFeeWire(): FeeWire {
    return this.feeWire;
  }

  getFeeACHPanama(): FeeACHPanama {
    return this.feeACHPanama;
  }

  activeTwoFactorAuth(): void {
    this.twoFactorActive = true;
  }

  disableTwoFactorAuth(): void {
    this.twoFactorActive = false;
  }

  updateData(data: IndividualDTO | CompanyDTO): void {
    this.clientData = data;
    delete this.clientData.password;
    delete this.clientData._id;
  }

  markAsSendData(): IClient {
    this.status = AccountStatus.SUBMITTED;
    return this;
  }

  markAsUnderReview(): IClient {
    this.status = AccountStatus.PROCESSING;
    return this;
  }

  approveSegregated(): void {
    this.status = AccountStatus.APPROVED;
    this.setApprovedAt(new Date());

    this.accountId = process.env.PINTTOSOFT_ACCOUNT;
    this.isSegregated = true;
  }

  approveOwnAccount(): void {
    this.isSegregated = false;
    this.setApprovedAt(new Date());
    this.status = AccountStatus.APPROVED;
  }

  rejectSegregated(): void {
    this.status = AccountStatus.REJECTED;
  }

  getKycActions(): KycAction[] {
    if (this.clientType === AccountType.INDIVIDUAL) {
      return this.kycRequestedChanges;
    }

    const actions: KycAction[] = [];
    this.getCompanyPartners().map((partner: IndividualDTO) => {
      actions.push(...partner.kycRequestedChanges);
    });

    return actions;
  }

  setKycAction(kycAction: KycAction): IClient {
    if (!this.kycRequestedChanges) {
      this.kycRequestedChanges = [kycAction];
    } else {
      this.kycRequestedChanges.push(kycAction);
    }

    return this;
  }

  setKycActionToPartner(kycAction: KycAction): IClient {
    const partners = this.getCompanyPartners().map((partner) => {
      if (partner.dni === kycAction.dni) {
        const actions = partner.kycRequestedChanges ?? [];

        return {
          ...partner,
          kycRequestedChanges: [...actions, kycAction],
        };
      }

      return partner;
    });
    this.setClientData({ ...this.clientData, partners });

    return this;
  }

  deleteKycAction(id: string) {
    if (!this.kycRequestedChanges || this.kycRequestedChanges.length === 0) {
      throw new GenericException("Action not found");
    }

    const foundActionIndex = this.kycRequestedChanges.findIndex(
      (action: KycAction): boolean => action.id === id,
    );

    if (foundActionIndex === -1) {
      throw new GenericException("No action found");
    }

    this.kycRequestedChanges.splice(foundActionIndex, 1);
  }

  deleteKycActionToPartner(kycAction: KycAction): void {
    const partners = this.getCompanyPartners();

    if (!partners || partners.length === 0) {
      throw new GenericException("No partners for the company");
    }

    const foundPartnerIndex = partners.findIndex(
      (partner): boolean => partner.dni === kycAction.dni,
    );

    if (foundPartnerIndex === -1) {
      throw new GenericException("Partner not found");
    }

    const foundActionIndex = partners[
      foundPartnerIndex
    ].kycRequestedChanges.findIndex(
      (action): boolean => action.id === kycAction.id,
    );

    if (foundActionIndex === -1) {
      throw new GenericException("No action found for the partner");
    }

    partners[foundPartnerIndex].kycRequestedChanges.splice(foundActionIndex, 1);

    this.setClientData({ ...this.clientData, partners });
  }

  deleteAllDocumentsPartners(dni: string): void {
    this.companyPartners.forEach((p: IOwnerAccount) => {
      if (p.getIdentifyNumber() === dni) {
        p.deleteAllDocs();
      }
    });
  }

  // retorna los documento del cliente de la cuenta, es decir
  // si es un cliente individual retorna sus documentos
  // si es una empresa retorna los documentos de la empresa
  getPrincipalDocuments(): Documents[] {
    return this.documents;
  }

  getInvestmentProfile(): InvestmentProfile {
    return {
      monthlyCryptoDeposits: this.clientData.monthlyCryptoDeposits ?? "",
      monthlyCryptoInvestmentDeposit:
        this.clientData.monthlyCryptoInvestmentDeposit ?? "",
      monthlyCryptoInvestmentWithdrawal:
        this.clientData.monthlyCryptoInvestmentWithdrawal ?? "",
      monthlyCryptoWithdrawals: this.clientData.monthlyCryptoWithdrawals ?? "",
      monthlyDeposits: this.clientData.monthlyDeposits ?? "",
      monthlyInvestmentDeposit: this.clientData.monthlyInvestmentDeposit ?? "",
      monthlyInvestmentWithdrawal:
        this.clientData.monthlyInvestmentWithdrawal ?? "",
      monthlyWithdrawals: this.clientData.monthlyWithdrawals ?? "",
      primarySourceOfFunds: this.clientData.primarySourceOfFunds ?? "",
      usdValueOfCrypto: this.clientData.usdValueOfCrypto ?? "",
      usdValueOfFiat: this.clientData.usdValueOfFiat ?? "",
    };
  }

  getKYCProfile(): KycProfileType {
    return {
      fundsSendReceiveJurisdictions:
        this.clientData.fundsSendReceiveJurisdictions ?? "",
      engageInActivities: this.clientData.engageInActivities ?? "",
    };
  }

  toPrimitives(): any {
    return {
      isSegregated: this.isSegregated,
      clientId: this.clientId,
      ...this.clientData,
      type: this.clientType,
      accountId: this.accountId,
      status: this.status,
      feeSwap: this.feeSwap.toPrimitives(),
      feeWire: this.feeWire.toPrimitives(),
      FeeACHPanama: this.feeACHPanama ? this.feeACHPanama.toPrimitives() : null,
      documents: this.documents.map((d: Documents) => d.toPrimitives()),
      twoFactorActive: this.twoFactorActive,
      createdAt: this.createdAt,
      approvedAt: this.approvedAt,
      kycRequestedChanges: this.kycRequestedChanges,
    };
  }
}
