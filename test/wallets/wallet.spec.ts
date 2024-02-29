import { v4 } from "uuid";
import {
  AssetMongoRepository,
  ClientMongoRepository,
  CounterpartyMongoRepository,
  InstructionsAchPabType,
  IWallet,
  logger,
  MakeRequestInternalTransfer,
  Transaction,
  TransactionMongoRepository,
  TransactionType,
  WalletFactory,
  WalletMongoRepository,
  WalletType,
  WithdrawalRequestMongoRepository,
  WithdrawalStatus,
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
    console.log("USD_PA", pab);

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

    console.log("res", res);

    //console.log(wallet.getBalanceAvailable());
    //console.log("walletPayload", walletPayload);
  });

  // 1st step
  it("Should update ACH PAB balances", async () => {
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

    console.log("===== withdrawalId", withdrawalId);
  });
});

// 2nd step create withdrawal request, transaction and updating balance
it("Should finish an internal withdrawal request and create a transaction", async () => {
  const walletRepo = WalletMongoRepository.instance();
  const withdrawalRepo = WithdrawalRequestMongoRepository.instance();
  const transactionRepo = TransactionMongoRepository.instance();

  const clientOriginId = "MSerrano181263254";
  const clientDestinationId = "FSilva187263254";

  const asset = await AssetMongoRepository.instance().findAssetByCode("USD_PA");

  const withdrawalId = "8dfad6d3-d546-49bb-8b34-0d8759297dc0";

  const withdrawal = await withdrawalRepo.findByWithdrawalId(withdrawalId);

  withdrawal.markAsProcessed();
  await withdrawalRepo.upsert(withdrawal);

  const transactionId: string = v4();

  const transaction: Transaction = Transaction.newTransaction(
    transactionId,
    withdrawal.getAmount() * -1,
    withdrawal.getReference(),
    withdrawal.getClientId(),
    true,
    withdrawal.getCounterparty(),
    TransactionType.WITHDRAW,
    WithdrawalStatus.PROCESSED,
  );

  await transactionRepo.upsert(transaction);

  const amount = withdrawal.getAmount();

  const originWallet: IWallet =
    await walletRepo.findWalletsByClientIdAndAssetId(
      clientOriginId,
      asset.getAssetId(),
    );

  const destinationWallet: IWallet =
    await walletRepo.findWalletsByClientIdAndAssetId(
      clientDestinationId,
      asset.getAssetId(),
    );

  await updateACHWallet(originWallet, amount, false);
  await updateACHWallet(destinationWallet, amount, true);
});

it("Should finish an external withdrawal request and create a transaction", async () => {
  const walletRepo = WalletMongoRepository.instance();
  const withdrawalRepo = WithdrawalRequestMongoRepository.instance();
  const transactionRepo = TransactionMongoRepository.instance();

  const clientOriginId = "MSerrano181263254";

  const asset = await AssetMongoRepository.instance().findAssetByCode("USD_PA");

  const withdrawalId = "b14432d2-f1d7-4479-a507-9697362b9c18";

  const withdrawal = await withdrawalRepo.findByWithdrawalId(withdrawalId);

  withdrawal.markAsProcessed();
  await withdrawalRepo.upsert(withdrawal);

  const transactionId: string = v4();

  const transaction: Transaction = Transaction.newTransaction(
    transactionId,
    withdrawal.getAmount() * -1,
    withdrawal.getReference(),
    withdrawal.getClientId(),
    false,
    withdrawal.getCounterparty(),
    TransactionType.WITHDRAW,
    WithdrawalStatus.PROCESSED,
  );

  await transactionRepo.upsert(transaction);

  const amount = withdrawal.getAmount();

  const originWallet: IWallet =
    await walletRepo.findWalletsByClientIdAndAssetId(
      clientOriginId,
      asset.getAssetId(),
    );

  await updateACHWallet(originWallet, amount, false);
});

const updateACHWallet = async (
  wallet: IWallet,
  amount: number,
  isCredit = true,
) => {
  const walletRepo = WalletMongoRepository.instance();

  if (isCredit) {
    /*wallet.setNewBalance(
                          wallet.getBalance() + amount,
                          wallet.getLockedBalance(),
                        );*/
    wallet.addFunds(amount);
  } else {
    wallet.setNewBalance(
      wallet.getBalance() - amount,
      -wallet.getLockedBalance() - amount,
    );
  }

  await walletRepo.updateBalance(wallet);
};
