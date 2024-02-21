import { Transaction } from "../../domain/transaction";
import {
  Criteria,
  Filters,
  MongoClientFactory,
  MongoRepository,
  Operator,
  Order,
  OrderTypes,
  Paginate,
  WithdrawalStatus,
} from "../../../shared";
import {
  ExchangeTransaction,
  ITransactionRepository,
  TransactionType,
} from "../../index";
import { Counterparty, CounterpartyType } from "../../../counterparty";
import { CounterpartyAchPab, CounterpartyBank } from "../../../banking";
import { CounterpartyAsset } from "../../../asset";
import { TransactionDeposit } from "../../domain/transaction_deposit";

export class TransactionMongoRepository
  extends MongoRepository<
    Transaction | ExchangeTransaction | TransactionDeposit
  >
  implements ITransactionRepository
{
  private static _instance: TransactionMongoRepository;

  constructor() {
    super(MongoClientFactory.createClient());
  }

  public static instance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new TransactionMongoRepository();
    return this._instance;
  }

  collectionName(): string {
    return "transaction";
  }

  async findDepositByAssetIdAndAmountAndStatusAndReference(
    assetId: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<Transaction | undefined> {
    const collection = await this.collection();
    const filter = {
      assetId,
      status,
      amount,
      reference,
      transactionType: TransactionType.DEPOSIT,
    };

    const result = await collection.findOne(filter);

    if (!result) {
      return null;
    }

    const counterparty: Counterparty = this.buildCounterparty(result);
    return Transaction.fromPrimitives(
      result._id.toString(),
      result,
      counterparty,
    );
  }

  async findWithdrawByAssetIdAndAmountAndStatusAndReference(
    assetId: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<Transaction | undefined> {
    const collection = await this.collection();
    const filter = {
      assetId,
      status,
      amount,
      reference,
      transactionType: TransactionType.WITHDRAW,
    };

    const result = await collection.findOne(filter);
    if (!result) {
      return null;
    }

    const counterparty: Counterparty = this.buildCounterparty(result);
    return Transaction.fromPrimitives(
      result._id.toString(),
      result,
      counterparty,
    );
  }

  async findTransactionByClientId(
    accountId: string,
    initDoc: number,
  ): Promise<Paginate<Transaction>> {
    const filterAccountId: Map<string, string> = new Map([
      ["field", "accountId"],
      ["operator", Operator.EQUAL],
      ["value", accountId],
    ]);

    const criteria = new Criteria(
      Filters.fromValues([filterAccountId]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      20,
      initDoc,
    );

    const document = await this.searchByCriteria<Transaction>(criteria);

    return this.buildPaginate<Transaction>(document);
  }

  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<Transaction | undefined> {
    const filter = {
      transactionId,
    };
    const collection = await this.collection();
    const result = await collection.findOne(filter);

    if (!result) {
      return undefined;
    }

    const counterparty: Counterparty = this.buildCounterparty(result);

    return Transaction.fromPrimitives(
      result._id.toString(),
      result,
      counterparty,
    );
  }

  private buildCounterparty(result: any): Counterparty {
    if (result.counterparty.achInstructions) {
      return CounterpartyAchPab.fromPrimitives(
        result.counterparty.id,
        result.counterparty,
      );
    }

    return result.counterparty.counterpartyType == CounterpartyType.FIAT
      ? CounterpartyBank.fromPrimitives(
          result.counterparty.id,
          result.counterparty,
        )
      : CounterpartyAsset.fromPrimitives(
          result.counterparty.id,
          result.counterparty,
        );
  }

  async findWithdrawalByClientIdAndAssetIdAndAmountAndStatusAndReference(
    clientId: string,
    assetId: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<Transaction | undefined> {
    const filter = {
      clientId,
      assetId,
      status,
      amount,
      reference,
      transactionType: TransactionType.WITHDRAW,
    };
    const collection = await this.collection();
    const result = await collection.findOne(filter);

    if (!result) {
      return undefined;
    }

    const counterparty: Counterparty = this.buildCounterparty(result);

    return Transaction.fromPrimitives(
      result._id.toString(),
      result,
      counterparty,
    );
  }

  async historyTransactionByAssetIdAndClientId(
    clientId: string,
    assetId: string,
    initDoc: number = 1,
  ): Promise<Paginate<Transaction> | null> {
    const filterAccountId: Map<string, string> = new Map([
      ["field", "clientId"],
      ["operator", Operator.EQUAL],
      ["value", clientId],
    ]);

    const filterAssetCode: Map<string, string> = new Map([
      ["field", "assetId"],
      ["operator", Operator.EQUAL],
      ["value", assetId],
    ]);

    const criteria: Criteria = new Criteria(
      Filters.fromValues([filterAccountId, filterAssetCode]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      20,
      initDoc,
    );

    let document = await this.searchByCriteria<Transaction>(criteria);

    return this.buildPaginate<Transaction>(document);
  }

  async upsert(transaction: Transaction): Promise<void> {
    await this.persist(transaction.getId(), transaction);
  }

  async transactionListing(criteria: Criteria): Promise<Paginate<Transaction>> {
    let document = await this.searchByCriteria<any>(criteria);

    document = document.map((d) => ({
      ...d,
      id: d._id.toString(),
      _id: undefined,
    }));

    return this.buildPaginate<Transaction>(document);
  }

  /**
   * Metodo que permite guardar y ACTUALIZAR una transaccion de intercambio
   * @param transaction
   */
  async saveExchangeTransaction(
    transaction: ExchangeTransaction,
  ): Promise<void> {
    await this.persist(transaction.getId(), transaction);
  }

  async findExchangeTransactionByExchangeIdAndStatus(
    transactionId: string,
    status: WithdrawalStatus,
  ): Promise<ExchangeTransaction | undefined> {
    const filter = {
      transactionId,
      status,
    };

    const collection = await this.collection();
    const result = await collection.findOne(filter);

    if (!result) {
      return undefined;
    }

    return ExchangeTransaction.fromPrimitives(result._id.toString(), result);
  }

  async saveDepositTransaction(transaction: TransactionDeposit): Promise<void> {
    await this.persist(transaction.getId(), transaction);
  }
}
