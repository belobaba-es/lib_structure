import { Transaction } from "../../domain/transaction";
import { ITransactionRepository, TransactionType } from "@/transaction";
import {
  MongoClientFactory,
  MongoRepository,
} from "@/shared/infrastructure/mongodb";
import { WithdrawalStatus } from "@/shared/domain/enums/withdrawal_status.enum";
import { TransactionDTO } from "@/transaction/domain/types/transaction.type";
import { Paginate } from "@/shared/domain/types/paginate";
import {
  Criteria,
  Filters,
  Operator,
  Order,
  OrderTypes,
} from "@/shared/domain/criteria";
export class Transaction_mongo_repository
  extends MongoRepository<Transaction>
  implements ITransactionRepository
{
  private static _instance: Transaction_mongo_repository;

  constructor() {
    super(MongoClientFactory.createClient());
  }

  public static instance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Transaction_mongo_repository();
    return this._instance;
  }

  collectionName(): string {
    return "transaction";
  }

  async findByAssetTransferMethodAndStatusAndAmount(
    assetCode: string,
    assetTransferMethod: string,
    status: WithdrawalStatus,
    amount: number,
  ): Promise<TransactionDTO | null> {
    const collection = await this.collection();
    const filter = {
      "to.assetTransferMethod": assetTransferMethod,
      assetCode: assetCode,
      status,
      amount,
    };

    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: result._id.toString(),
    } as unknown as TransactionDTO;
  }

  async findByFundsTransferMethodAndStatusAndAmount(
    fundsTransferMethod: string,
    status: WithdrawalStatus,
    amount: number,
  ): Promise<TransactionDTO | null> {
    const collection = await this.collection();
    const filter = {
      "to.fundsTransferMethods": fundsTransferMethod,
      status,
      amount,
      assetCode: "USD",
    };

    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: result._id.toString(),
    } as unknown as TransactionDTO;
  }

  async findDepositByAssetCodeAndAmountAndStatusAndReference(
    assetCode: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<TransactionDTO | null> {
    const collection = await this.collection();
    const filter = {
      assetCode,
      status,
      amount,
      reference,
      transactionType: TransactionType.DEPOSIT,
    };

    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: result._id.toString(),
    } as unknown as TransactionDTO;
  }

  async findTransactionByAccountId(
    accountId: string,
    initDoc?: string,
  ): Promise<Paginate<TransactionDTO>> {
    const filterAccountId: Map<string, string> = new Map([
      ["field", "accountId"],
      ["operator", Operator.EQUAL],
      ["value", accountId],
    ]);

    const criteria = new Criteria(
      Filters.fromValues([filterAccountId]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      20,
      Number(initDoc),
    );

    const document = await this.searchByCriteria<TransactionDTO>(criteria);

    return this.buildPaginate<TransactionDTO>(document);
  }

  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<TransactionDTO | null> {
    const filter = {
      transactionId,
    };
    const collection = await this.collection();
    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: result._id.toString(),
    } as unknown as TransactionDTO;
  }

  async findWithdrawalByAccountIdAndAssetCodeAndAmountAndStatusAndReference(
    accountId: string,
    assetCode: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<TransactionDTO> {
    const filter = {
      accountId,
      assetCode,
      status,
      amount,
      reference,
      transactionType: TransactionType.WITHDRAW,
    };
    const collection = await this.collection();
    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    return {
      ...result,
      id: result._id.toString(),
    } as unknown as TransactionDTO;
  }

  async historyTransactionByAssetCodeAndAccountId(
    accountId: string,
    assetCode: string,
    initDoc?: string | Number,
  ): Promise<Paginate<TransactionDTO> | null> {
    const filterAccountId: Map<string, string> = new Map([
      ["field", "accountId"],
      ["operator", Operator.EQUAL],
      ["value", accountId],
    ]);

    const filterAssetCode: Map<string, string> = new Map([
      ["field", "assetCode"],
      ["operator", Operator.EQUAL],
      ["value", assetCode],
    ]);

    const criteria = new Criteria(
      Filters.fromValues([filterAccountId, filterAssetCode]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      20,
      Number(initDoc === "" ? 1 : initDoc),
    );

    let document = await this.searchByCriteria<any>(criteria);

    document = document.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: undefined,
    }));

    return this.buildPaginate<TransactionDTO>(document);
  }

  async upsertTransaction(transaction: Transaction): Promise<void> {
    await this.persist(transaction.getId(), transaction.toPrimitives());
  }

  async transactionListing(
    criteria: Criteria,
  ): Promise<Paginate<TransactionDTO>> {
    let document = await this.searchByCriteria<any>(criteria);

    document = document.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: undefined,
    }));

    return this.buildPaginate<TransactionDTO>(document);
  }
}
