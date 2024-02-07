import {
  AssetMongoRepository,
  ClientMongoRepository,
  CounterpartyMongoRepository,
  MakeRequestInternalTransfer,
  TransactionMongoRepository,
  WalletMongoRepository,
  WithdrawalRequestMongoRepository,
  WithdrawalStatus,
} from "../../src";

describe("Make request internal transfer", () => {
  it("should create make request internal transfer of the USD", async () => {
    const payload = {
      amount: 100,
      clientIdOrign: "FSilva187263254",
      clientIdDestination: "DANIELLEE002",
      reference: "Teste",
    };

    const transfer = await new MakeRequestInternalTransfer(
      ClientMongoRepository.instance(),
      WalletMongoRepository.instance(),
      AssetMongoRepository.instance(),
      WithdrawalRequestMongoRepository.instance(),
      CounterpartyMongoRepository.instance(),
    ).run(
      payload.clientIdOrign,
      payload.clientIdDestination,
      payload.amount,
      "USD",
      payload.reference,
    );
  });

  describe("Mark transaction as processed", () => {
    it("should ", async () => {
      const transaction =
        await TransactionMongoRepository.instance().findExchangeTransactionByExchangeIdAndStatus(
          "f0a1285f-2bdc-4279-b753-a1222900c619",
          WithdrawalStatus.IN_PROCESS,
        );
      transaction.markAsCompleted();

      await TransactionMongoRepository.instance().saveExchangeTransaction(
        transaction,
      );

      console.log(transaction);
    });

    it("should search transaction", async () => {
      const transaction =
        await TransactionMongoRepository.instance().findWithdrawByAssetIdAndAmountAndStatusAndReference(
          "FIAT_TESTNET_PAB",
          -7,
          WithdrawalStatus.IN_PROCESS,
          "External ACH",
        );
      //transaction.markAsCompleted();

      console.log("transaction", transaction);
    });
  });
});
