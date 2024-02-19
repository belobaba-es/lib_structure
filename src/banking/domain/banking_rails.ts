import { AggregateRoot } from "../../shared/domain/aggregate_root";

export class BankingRails extends AggregateRoot {
  private id?: string;
  private countryCode: string;
  private countryName: string;
  private assetCountry: string;
  private rails: Array<string>;
  private provider: string;

  getId(): string {
    return this.id;
  }

  getCountryCode(): string {
    return this.countryCode;
  }

  getAssetCountry(): string {
    return this.assetCountry;
  }

  fromPrimitives(data: any): BankingRails {
    const rail = new BankingRails();
    rail.id = data.id;
    rail.countryCode = data.countryCode;
    rail.countryName = data.countryName;
    rail.assetCountry = data.assetCountry;
    rail.rails = data.rails;
    rail.provider = data.provider;

    return rail;
  }

  toPrimitives(): any {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      assetCountry: this.assetCountry,
      rails: this.rails,
      provider: this.provider,
    };
  }
}
