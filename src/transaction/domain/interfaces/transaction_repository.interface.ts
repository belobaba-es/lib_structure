import { Transaction } from "../transaction";
import { Criteria, Paginate, WithdrawalStatus } from "../../../shared";
import { ExchangeTransaction } from "../exchange_transaction";
import { TransactionDeposit } from "../transaction_deposit";

export interface ITransactionRepository {
  historyTransactionByAssetIdAndClientId(
    clientId: string,
    assetCode: string,
    initDoc: number,
  ): Promise<Paginate<Transaction>>;

  upsert(transaction: Transaction): Promise<void>;

  findTransactionByClientId(
    accountId: string,
    initDoc: number,
  ): Promise<Paginate<Transaction> | undefined>;

  findTransactionByTransactionId(
    transactionId: string,
  ): Promise<Transaction | null>;

  findDepositByAssetIdAndAmountAndStatusAndReference(
    assetCode: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<Transaction | undefined>;

  transactionListing(criteria: Criteria): Promise<Paginate<Transaction>>;

  findWithdrawalByClientIdAndAssetIdAndAmountAndStatusAndReference(
    clientId: string,
    assetCode: string,
    amount: number,
    status: WithdrawalStatus,
    reference: string,
  ): Promise<Transaction | undefined>;

  saveExchangeTransaction(transaction: ExchangeTransaction): Promise<void>;

  saveDepositTransaction(transaction: TransactionDeposit): Promise<void>;

  findExchangeTransactionByExchangeIdAndStatus(
    transactionId: string,
    status: WithdrawalStatus,
  ): Promise<ExchangeTransaction | undefined>;

  findTransactionByAssetIdAmountStatusClientId(
    assetId: string,
    amount: number,
    status: WithdrawalStatus,
    clientId: string,
  ): Promise<Transaction | undefined>;
}
