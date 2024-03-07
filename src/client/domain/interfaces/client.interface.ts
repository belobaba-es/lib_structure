import { AccountStatus, AccountType, IAccount } from "../../../account";
import { Address, ContactInformation } from "../../../shared";
import { ResidencyStatus } from "../enums/residency_status";
import { FeeACHPanama, FeeSwap, FeeWire } from "../../../system_configuration";
import { CompanyDTO } from "../types/company.type";
import { Documents } from "../../../documents";
import { IndividualDTO, individualType } from "../types/Individual.type";
import { KycAction } from "../types/kyc-action.type";
import { InvestmentProfile } from "../types/investment-profile.type";
import { KycProfileType } from "../types/kyc-profile.type";

export interface IClient {
  getId(): string;

  toPrimitives(): any;

  getAccount(): IAccount;

  getClientId(): string;

  getClientType(): AccountType;

  getName(): string;

  getEmail(): string;

  getIDNumber(): string;

  getAddress(): Address;

  getTaxId(): string;

  getContactInformation(): ContactInformation;

  getDateOfBirth(): Date;

  getPassportNumber(): string;

  getResidencyStatus(): ResidencyStatus;

  getNaics(): { code: string; description: string };

  getCompanyToPrimitives(): CompanyDTO;

  getEstablishedDate(): Date;

  getWebSite(): string;

  getStatus(): AccountStatus;

  getFeeSwap(): FeeSwap;

  getFeeWire(): FeeWire;

  getFeeACHPanama(): FeeACHPanama;

  getPrincipalDocuments(): Documents[];

  setDocument(dni: string, document: Documents): IClient;

  setStatus(clientStatus: AccountStatus): IClient;

  activeTwoFactorAuth(): void;

  disableTwoFactorAuth(): void;

  updateData(data: IndividualDTO | CompanyDTO): void;

  approveSegregated(): void;

  approveOwnAccount(): void;

  rejectSegregated(): void;

  markAsSendData(): IClient;

  markAsUnderReview(): IClient;

  getKycActions(): KycAction[];

  setKycAction(kycActions: KycAction): IClient;

  setFeeSwap(feeSwap: FeeSwap): IClient;

  setFeeWire(feeWire: FeeWire): IClient;

  setFeeACHPanama(feeACHPanama: FeeACHPanama): IClient;

  deleteKycAction(id: string): void;

  setKycActionToPartner(kycAction: KycAction): IClient;

  deleteKycActionToPartner(kycAction: KycAction): void;

  deleteAllDocumentsPartners(dni: string): void;

  getCompanyPartners(): individualType[] | undefined;

  getInvestmentProfile(): InvestmentProfile;

  getKYCProfile(): KycProfileType;

  getOccupation(): string;

  getEmploymentStatus(): string;
}
