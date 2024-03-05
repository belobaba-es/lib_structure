import {
  AmountValueObject,
  AssetMongoRepository,
  ClientMongoRepository,
  CounterpartyMongoRepository,
  WithdrawalPurpose,
  WithdrawalRequest,
  WithdrawalType,
} from "../../src";

describe("Withdrawals", () => {
  it("e2e Create withdrawal request for ACH PAB internal", async () => {
    const clientId = "MSerrano181263254";
    const clientDestinationId = "FSilva187263254";
    const clientOrigin =
      await ClientMongoRepository.instance().findByClientId(clientId);

    const clientDestination =
      await ClientMongoRepository.instance().findByClientId(
        clientDestinationId,
      );

    const amount = 1.3;
    const reference = "-- release funds";

    const asset =
      await AssetMongoRepository.instance().findAssetByCode("USD_PA");

    const counterparty =
      await CounterpartyMongoRepository.instance().findMyCounterpartyByAssetId(
        clientOrigin.getClientId(),
        clientDestination.getClientId(),
        asset.getAssetId(),
      );

    expect(counterparty).not.toBe(undefined);

    const withdrawalRequest: WithdrawalRequest =
      WithdrawalRequest.createNewWithdrawalRequest(
        clientOrigin,
        counterparty,
        AmountValueObject.create(amount),
        reference,
        WithdrawalType.INTERNAL,
        WithdrawalPurpose.LOAN,
      );

    expect(withdrawalRequest).not.toBe(undefined);
    //await WithdrawalRequestMongoRepository.instance().upsert(withdrawalRequest);
  });

  it("Create withdrawal request for ACH PAB external", async () => {
    const clientId = "MSerrano181263254";
    const clientOrigin =
      await ClientMongoRepository.instance().findByClientId(clientId);
    const counterpartyId = "35e68682-8212-49a0-af95-e56e3e3aa92b";

    const amount = 2.6;
    const reference = "first external withdrawal request test";
    const asset =
      await AssetMongoRepository.instance().findAssetByCode("USD_PA");

    const counterparty =
      await CounterpartyMongoRepository.instance().findMyCounterpartyByAssetId(
        clientOrigin.getClientId(),
        counterpartyId,
        asset.getAssetId(),
      );

    console.log("counterparty", counterparty);

    expect(counterparty).not.toBe(undefined);

    const withdrawalRequest: WithdrawalRequest =
      WithdrawalRequest.createNewWithdrawalRequest(
        clientOrigin,
        counterparty,
        AmountValueObject.create(amount),
        reference,
        WithdrawalType.EXTERNAL,
        WithdrawalPurpose.LOAN,
      );

    expect(withdrawalRequest).not.toBe(undefined);
    //await WithdrawalRequestMongoRepository.instance().upsert(withdrawalRequest);
  });
});
