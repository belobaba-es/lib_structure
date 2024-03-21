import { BankingRails } from "../banking_rails";

export interface IBankingRepository {
  findBankingRailByCountryCode(
    countryCode: string,
  ): Promise<BankingRails | undefined>;

  findAllBankingRails(): Promise<BankingRails[]>;
}
