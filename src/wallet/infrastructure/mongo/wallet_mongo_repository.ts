import {
  InstructionDepositCrypto,
  IWallet,
  IWalletRepository,
  WalletFactory,
} from "../../../wallet";
import { MongoClientFactory, MongoRepository, Paginate } from "../../../shared";
import { ObjectId } from "mongodb";
import { ClientMongoRepository } from "../../../client";
import { AssetMongoRepository } from "../../../asset";

interface WalletDocument {
  _id: ObjectId;
  walletId: string;
  assetId: string;
  walletType: string;
  clientId: string;
  balance: number;
  lockedBalance: number;
  label: string;
}

export class WalletMongoRepository
  extends MongoRepository<IWallet>
  implements IWalletRepository
{
  private static _instance: WalletMongoRepository;

  constructor() {
    super(MongoClientFactory.createClient());
  }

  static instance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new WalletMongoRepository();
    return this._instance;
  }

  collectionName(): string {
    return "wallets";
  }

  async findWalletsByClientId(clientId: string): Promise<IWallet[]> {
    const collection = await this.collection();

    const result = await collection
      .find<WalletDocument>({
        clientId,
      })
      .toArray();

    const wallets: IWallet[] = [];

    for (const wallet of result) {
      const client = await ClientMongoRepository.instance().findByClientId(
        wallet.clientId,
      );

      wallets.push(
        WalletFactory.fromPrimitives(
          wallet._id.toString(),
          { ...wallet },
          client,
          await AssetMongoRepository.instance().findById(wallet.assetId),
        ),
      );
    }

    return wallets;
  }

  async updateBalance(wallet: IWallet): Promise<void> {
    const collection = await this.collection();
    await collection.updateOne(
      {
        walletId: wallet.getWalletId(),
        assetId: wallet.getAsset().getAssetId(),
      },
      {
        $set: {
          balance: wallet.getBalance(),
          lockedBalance: wallet.getLockedBalance(),
        },
      },
    );
  }

  async insert(wallet: IWallet): Promise<IWallet> {
    const id: ObjectId = await this.persist(wallet.getId(), wallet);

    return WalletFactory.fromPrimitives(
      id.toString(),
      wallet.toPrimitives(),
      wallet.getClient(),
      wallet.getAsset(),
    );
  }

  async update(wallet: IWallet): Promise<void> {
    await this.persist(wallet.getId(), wallet);
  }

  async findPaymentAddressByClientId(
    clientId: string,
    page: number,
    perPage: number,
  ): Promise<Paginate<InstructionDepositCrypto>> {
    return await this.paginatePaymentAddress({ clientId }, page, perPage);
  }

  async findPaymentAddressesByClientIdAndByAssetId(
    clientId: string,
    assetId?: string,
  ): Promise<InstructionDepositCrypto[]> {
    const collection = await this.collection();

    let filter: any;
    if (assetId) {
      filter = { clientId, assetId, walletType: "DEPOSIT_FORT_CRYPTO" };
    } else {
      filter = { clientId, walletType: "DEPOSIT_FORT_CRYPTO" };
    }
    const pipeline = [
      {
        $match: filter,
      },
      {
        $project: {
          _id: 0,
          instructionForDeposit: 1,
          assetId: 1,
        },
      },
    ];

    return await collection
      .aggregate<InstructionDepositCrypto>(pipeline)
      .toArray();
  }

  async paginatePaymentAddress(filter: any, page: number, rowPerPage: number) {
    const collection = await this.collection();

    const result = await collection
      .find(filter)
      .project({
        instructForDeposit: {
          $slice: [(page - 1) * rowPerPage, rowPerPage],
        },
      })
      .toArray();

    const instructForDepositCount = await collection
      .find(filter)
      .project({
        instructForDeposit: 1,
      })
      .toArray();

    let count = instructForDepositCount.length;

    const hasNextPage: boolean = page * rowPerPage < count;

    let list: InstructionDepositCrypto[] = [];

    for (const r of result) {
      for (const instElement of r.instructForDeposit) {
        count++;
        list.push(instElement as InstructionDepositCrypto);
      }
    }

    return {
      nextPag: hasNextPage ? Number(page) + 1 : null,
      prevPag: null,
      count: count,
      results: list,
    };
  }

  async findWalletsByClientIdAndAssetId(
    clientId: string,
    assetId: string,
  ): Promise<IWallet | undefined> {
    const collection = await this.collection();

    const result = await collection.findOne<WalletDocument>({
      clientId,
      assetId,
    });

    if (!result) {
      return undefined;
    }

    return WalletFactory.fromPrimitives(
      result._id.toString(),
      result,
      await ClientMongoRepository.instance().findByClientId(clientId),
      await AssetMongoRepository.instance().findById(result.assetId),
    );
  }

  async findWalletsByClientIdAndAssetCode(
    clientId: string,
    assetCode: string,
  ): Promise<IWallet | undefined> {
    const collection = await this.collection();

    const result = await collection.findOne<WalletDocument>({
      clientId,
      assetCode,
    });

    if (!result) {
      return undefined;
    }

    return WalletFactory.fromPrimitives(
      result._id.toString(),
      result,
      await ClientMongoRepository.instance().findByClientId(clientId),
      await AssetMongoRepository.instance().findById(result.assetId),
    );
  }

  async findWalletByClientIdAndWalletId(
    clientId: string,
    walletId: string,
  ): Promise<IWallet | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne<WalletDocument>({
      clientId,
      walletId,
    });

    if (!result) {
      return undefined;
    }

    return WalletFactory.fromPrimitives(
      result._id.toString(),
      result,
      await ClientMongoRepository.instance().findByClientId(clientId),
      await AssetMongoRepository.instance().findById(result.assetId),
    );
  }

  // TODO es posible que a futuro se necesite tener varios instructForDeposit
  // async addNewInstructionForDeposit(wallet: IWallet): Promise<void> {
  //   const collection = await this.collection();
  //
  //   const instructions: InstructionDepositCrypto[] | InstructionDepositFiat[] =
  //     wallet.getInstructionForDeposit();
  //
  //   const updateDocument = {
  //     $push: {
  //       instructForDeposit: instructions[instructions.length - 1],
  //     },
  //   };
  //
  //   await collection.updateOne(
  //     {
  //       clientId: wallet.getClientId(),
  //       assetId: wallet.getAsset().getAssetId(),
  //     },
  //     updateDocument,
  //     {
  //       upsert: true,
  //     },
  //   );
  // }

  async findByWalletId(walletId: string): Promise<IWallet | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne<WalletDocument>({ walletId });
    if (!result) {
      return undefined;
    }

    return WalletFactory.fromPrimitives(
      result._id.toString(),
      result,
      await ClientMongoRepository.instance().findByClientId(result.clientId),
      await AssetMongoRepository.instance().findById(result.assetId),
    );
  }

  async findByInstructionForDepositId(
    instructionDepositId: string,
  ): Promise<IWallet | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne<WalletDocument>({
      "instructionForDeposit.id": instructionDepositId,
    });
    if (!result) {
      return undefined;
    }

    return WalletFactory.fromPrimitives(
      result._id.toString(),
      result,
      await ClientMongoRepository.instance().findByClientId(result.clientId),
      await AssetMongoRepository.instance().findById(result.assetId),
    );
  }
}
