import { IClient } from "../../client";
import { AggregateRoot } from "../../shared/domain/aggregate_root";
import { InstructionDepositCrypto, IWallet, WalletType } from "../../wallet";
import { v4 } from "uuid";
import { InstructionDepositFiat, InstructionsAchPabType } from "../../banking";
import { Asset } from "../../asset";

export class Wallet extends AggregateRoot implements IWallet {
  private id?: string;
  private walletId: string;
  private asset: Asset;
  private walletType: WalletType;
  private clientId: string;
  private balance: number;
  private lockedBalance: number;
  private label: string;
  private client: IClient;
  private instructForDeposit:
    | InstructionDepositFiat
    | InstructionDepositCrypto
    | InstructionsAchPabType;

  setId(id: string): Wallet {
    this.id = id;
    return this;
  }

  setWalletType(type: WalletType): Wallet {
    this.walletType = type;
    return this;
  }

  setClientId(clientId: string): IWallet {
    this.clientId = clientId;
    return this;
  }

  setWalletId(walletId: string): Wallet {
    this.walletId = walletId;
    return this;
  }

  setBalance(balance: number): IWallet {
    this.balance = balance;
    return this;
  }

  setLockedBalance(lockedBalance: number) {
    this.lockedBalance = lockedBalance;
  }

  setAsset(asset: Asset): Wallet {
    this.asset = asset;
    return this;
  }

  setClient(client: IClient): Wallet {
    this.client = client;
    this.clientId = client.getClientId();
    return this;
  }

  setInstructionForDeposit(
    data:
      | InstructionDepositCrypto
      | InstructionDepositFiat
      | InstructionsAchPabType
  ): Wallet {
    this.instructForDeposit = data;
    return this;
  }

  build(): void {
    this.balance = 0;
    this.lockedBalance = 0;
    this.walletId = v4();
  }

  getClientId(): string {
    return this.clientId;
  }

  getClient(): IClient {
    return this.client;
  }

  /**
   * Genera un identificador para solicitar instrucciones de deposito
   * @param label
   */
  getIdentifierForInstructionOfDeposit(label: string): string {
    return this.instructForDeposit.id;
  }

  getInstructionForDeposit():
    | InstructionDepositFiat
    | InstructionDepositCrypto
    | InstructionsAchPabType {
    return this.instructForDeposit;
  }

  getAccountId(): string {
    return this.client.getAccount().getAccountId();
  }

  getWalletId(): string {
    return this.walletId;
  }

  getBalance(): number {
    return this.balance;
  }

  getLockedBalance(): number {
    return this.lockedBalance;
  }

  calculateNewBalance(balance: number, lockedBalance: number): IWallet {
    this.balance = balance;
    this.lockedBalance = lockedBalance;
    return this;
  }

  getAsset(): Asset {
    return this.asset;
  }

  getId(): string {
    return this.id;
  }

  getWalletType(): WalletType {
    return this.walletType;
  }

  getBalanceAvailable(): number {
    return this.walletType === WalletType.FIAT
      ? this.truncate(Number(this.balance) - Number(this.lockedBalance), 2)
      : this.truncate(Number(this.balance) - Number(this.lockedBalance), 6);
  }

  updateLockedBalance(amount: number): IWallet {
    let d = 3;

    if (
      this.getAsset().getAssetCode() !== "USD" &&
      this.getAsset().getAssetCode() !== "USD_PA"
    ) {
      d = 8;
    }

    if (Number(amount) > 0) {
      this.lockedBalance = this.truncate(
        Number(this.lockedBalance) - Number(amount),
        d
      );
      return this;
    }
    this.lockedBalance = this.truncate(
      Number(this.lockedBalance) + Number(amount),
      d
    );
    return this;
  }

  releaseBlockedBalance(amount: number): IWallet {
    let d = 3;

    if (this.getAsset().getAssetCode() !== "USD") {
      d = 8;
    }

    this.lockedBalance = this.truncate(
      Number(this.lockedBalance) + Number(amount),
      d
    );
    return this;
  }

  updateBalance(amount: number): IWallet {
    let d = 3;

    if (this.getAsset().getAssetCode() !== "USD") {
      d = 8;
    }

    // this.balance = this.truncate(Number(this.balance) - Number(amount), d);
    this.balance = Number((Number(this.balance) - Number(amount)).toFixed(d));
    return this;
  }

  setNewBalance(balance: number, lockedBalance: number): IWallet {
    this.balance = balance;
    this.lockedBalance = lockedBalance;
    return this;
  }

  private truncate(n, d: number) {
    let s = n.toString();
    let l = s.length;
    let decimalLength = s.indexOf(".") + 1;
    if (decimalLength === 0) {
      return Number(n);
    }

    let numStr = s.substr(0, decimalLength + d);
    return Number(numStr);
  }

  toPrimitives(): any {
    return {
      id: this.id,
      walletId: this.walletId,
      assetId: this.getAsset().getAssetId(),
      walletType: this.walletType,
      clientId: this.clientId,
      balance: this.balance,
      lockedBalance: this.lockedBalance,
      instructionForDeposit: this.instructForDeposit,
    };
  }
}
