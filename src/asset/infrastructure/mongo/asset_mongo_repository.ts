import { MongoClientFactory, MongoRepository } from "../../../shared";
import { Asset } from "../../domain/asset";
import { IAssetRepository } from "../../domain/interfaces/asset_repository.interface";
import { AssetTypeEnum } from "../../domain/types/asset_type.enum";

export class AssetMongoRepository
  extends MongoRepository<Asset>
  implements IAssetRepository
{
  private static _instance: AssetMongoRepository;

  public static instance(): AssetMongoRepository {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new AssetMongoRepository();
    return this._instance;
  }

  constructor() {
    super(MongoClientFactory.createClient());
  }

  collectionName(): string {
    return "assets";
  }

  async all(): Promise<Asset[] | undefined> {
    const collection = await this.collection();
    const result = await collection.find().toArray();

    return result.map((r) => Asset.fromPrimitives(r._id.toString(), r));
  }

  async findAssetByCode(code: string): Promise<Asset | undefined> {
    const collection = await this.collection();
    const r = await collection.findOne({ code });
    if (!r) {
      return undefined;
    }

    return Asset.fromPrimitives(r._id.toString(), r);
  }

  async findById(assetId: string): Promise<Asset | undefined> {
    const collection = await this.collection();
    const r = await collection.findOne({ assetId });
    if (!r) {
      return undefined;
    }

    return Asset.fromPrimitives(r._id.toString(), r);
  }

  async find(status: boolean, assetType?: AssetTypeEnum): Promise<Asset[]> {
    const collection = await this.collection();

    let filters: { active: boolean; assetType?: AssetTypeEnum } = {
      active: status,
    };
    if (assetType) {
      filters.assetType = assetType;
    }

    const result = await collection.find(filters).toArray();

    return result.map((r) => Asset.fromPrimitives(r._id.toString(), r));
  }
}
