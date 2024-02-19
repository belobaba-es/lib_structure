import { Asset } from "../asset";
import { AssetClassification } from "../enums/asset_classification.enum";

export interface IAssetRepository {
  findAssetByCode(code: string): Promise<Asset | undefined>;

  findById(assetId: string): Promise<Asset | undefined>;

  all(): Promise<Asset[]>;

  find(
    status: boolean,
    assetClassification?: AssetClassification,
  ): Promise<Asset[]>;
}
