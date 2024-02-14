import { Asset } from "../asset";
import { AssetTypeEnum } from "../types/asset_type.enum";

export interface IAssetRepository {
  findAssetByCode(code: string): Promise<Asset | undefined>;

  findById(assetId: string): Promise<Asset | undefined>;

  all(): Promise<Asset[]>;

  find(status: boolean, assetType?: AssetTypeEnum): Promise<Asset[]>;
}
