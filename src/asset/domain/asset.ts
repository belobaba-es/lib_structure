import { AggregateRoot } from "../../shared/domain/aggregate_root";
import { AssetClassification } from "./types/asset_classification.enum";

export class Asset extends AggregateRoot {
  private id?: string;
  private assetId: string;
  private assetClassification?: AssetClassification;
  private code: string;
  private icon: string;
  private name: string;
  private network: string;
  private networkName?: string;

  static createNewAsset(
    assetId: string,
    assetClassification: AssetClassification,
    code: string,
    icon: string,
    name: string,
    network: string,
    networkName?: string,
  ): Asset {
    const a: Asset = new Asset();

    a.assetId = assetId;
    a.assetClassification = assetClassification;
    a.code = code;
    a.icon = icon;
    a.name = name;
    a.network = network;
    a.networkName = networkName;

    return a;
  }

  static fromPrimitives(id: string, plainData: any): Asset {
    const a = Asset.createNewAsset(
      plainData.assetId,
      plainData.assetClassification,
      plainData.code,
      plainData.icon,
      plainData.name,
      plainData.network,
      plainData.networkName,
    );

    a.id = id;
    return a;
  }

  getId(): string {
    return this.id;
  }

  getAssetId() {
    return this.assetId;
  }

  getAssetCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getNetworkInformation() {
    return { name: this.networkName, network: this.network };
  }

  getIcon(): string {
    return this.icon;
  }

  isCryptoAsset(): boolean {
    return this.code !== "USD";
  }

  toPrimitives(): any {
    return {
      id: this.id,
      assetId: this.assetId,
      assetClassification: this.assetClassification,
      code: this.code,
      icon: this.icon,
      name: this.name,
      network: this.network,
      networkName: this.networkName,
    };
  }
}
