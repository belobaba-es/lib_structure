import {
  AssetMongoRepository,
  ClientMongoRepository,
  CounterpartyMongoRepository,
  InstructionsAchPabType,
  IWallet,
  logger,
  MakeRequestInternalTransfer,
  WalletFactory,
  WalletMongoRepository,
  WalletType,
  WithdrawalRequestMongoRepository,
} from "../../src";

describe("Wallet", () => {
  const clientId = "ABejarano187263254";

  // it("should create empty crypto wallet", async () => {
  //   const asset: Asset =
  //     await AssetMongoRepository.instance().findAssetByCode("BTC");
  //
  //   const client: IClient =
  //     await ClientMongoRepository.instance().findByClientId(clientId);
  //
  //   const wallet: IWallet = WalletFactory.createNewWallet(
  //     asset,
  //     client,
  //     WalletType.CRYPTO,
  //   );
  //
  //   await WalletMongoRepository.instance().upsert(wallet);
  // });

  // it("should add new instruction for deposit", async () => {
  //   const wallet =
  //     await WalletMongoRepository.instance().findWalletsByClientIdAndAssetId(
  //       clientId,
  //       "BITCOIN_TESTNET_BTC",
  //     );
  //
  //   wallet.addNewInstructionForDeposit({
  //     id: v4(),
  //     label: "label",
  //     qr: "qr",
  //     address: "address",
  //     balance: 0,
  //     lockedBalance: 0,
  //   } as InstructionDepositCrypto);
  //
  //   await WalletMongoRepository.instance().addNewInstructionForDeposit(wallet);
  //
  //   console.log(wallet.toPrimitives());
  // });
  //
  // it("should paginate payment address by clientId and assetId", async () => {
  //   const paymentAddress =
  //     await WalletMongoRepository.instance().findPaymentAddressesByClientIdAndByAssetId(
  //       clientId,
  //       "BITCOIN_TESTNET_BTC",
  //       1,
  //       10,
  //     );
  //
  //   console.log(JSON.stringify(paymentAddress));
  // });

  it("should paginate payment address by clientId", async () => {
    logger.info("should paginate payment address by clientId");
    const paymentAddress =
      await WalletMongoRepository.instance().findPaymentAddressesByClientIdAndByAssetId(
        clientId,
        undefined,
      );
  });

  it("should calculate locked balance", async () => {
    const wallet: IWallet =
      await WalletMongoRepository.instance().findWalletsByClientIdAndAssetId(
        "FSilva187263254",
        "BITCOIN_TESTNET_BTC",
      );

    wallet.updateLockedBalance(0.000056);
    console.log(wallet.toPrimitives());

    wallet.releaseBlockedBalance(0.000056);
    //
    console.log(wallet.toPrimitives());
  });

  it("should create ACH_PAB wallet", async () => {
    //const clientId = "JJimenez-Sequea12131548454";
    const clientId = "DANIELLEE002";
    const walletRepo = WalletMongoRepository.instance();

    const assetCode = "USD_PA";
    const assetRepo = AssetMongoRepository.instance();
    const pab = await assetRepo.findAssetByCode(assetCode);
    const client =
      await ClientMongoRepository.instance().findByClientId(clientId);

    const instructionForDeposits: InstructionsAchPabType = {
      id: `${client.getClientId()}-pab-${Math.random()}`,
      label: "",
      accountDestinationNumber: "",
      holderEmail: "",
      holderId: "",
      holderName: client.getName(),
      bankName: "",
      productType: "",
      concept: "",
    };

    const walletPayload: IWallet = WalletFactory.createNewWallet(
      pab,
      client,
      WalletType.FIAT,
      instructionForDeposits,
    );

    await walletRepo.insert(walletPayload);

    const res = await walletRepo.findPaymentAddressesByClientIdAndByAssetId(
      clientId,
      pab.getAssetId(),
    );

    expect(res).not.toBe(undefined);
  });

  // 1st step
  it("Should create a ACH PAB withdrawal request", async () => {
    const clientOriginId = "MSerrano181263254";
    const clientDestinationId = "FSilva187263254";

    const asset =
      await AssetMongoRepository.instance().findAssetByCode("USD_PA");
    const amount = 1.25;

    const withdrawalId = await new MakeRequestInternalTransfer(
      ClientMongoRepository.instance(),
      WalletMongoRepository.instance(),
      AssetMongoRepository.instance(),
      WithdrawalRequestMongoRepository.instance(),
      CounterpartyMongoRepository.instance(),
    ).run(
      clientOriginId,
      clientDestinationId,
      amount,
      asset.getAssetCode(),
      "1st test",
    );

    expect(withdrawalId).not.toBe(null);
  });

  it("Should debitFunds:  update balance and locked balance", async () => {
    const clientId = "MSerrano181263254";
    const txAmount = 10;

    const wallet =
      await WalletMongoRepository.instance().findWalletsByClientIdAndAssetId(
        clientId,
        "FIAT_TESTNET_PAB",
      );

    const balance = wallet.getBalance();
    wallet.debitFunds(txAmount);

    expect(wallet.getBalance()).toBe(balance - txAmount);
  });

  it("Should addFunds:  update balance", async () => {
    const clientId = "MSerrano181263254";
    const txAmount = 10;

    const wallet =
      await WalletMongoRepository.instance().findWalletsByClientIdAndAssetId(
        clientId,
        "FIAT_TESTNET_PAB",
      );
    const balance = wallet.getBalance();

    wallet.addFunds(txAmount);

    expect(wallet.getBalance()).toBe(balance + txAmount);
  });
});
