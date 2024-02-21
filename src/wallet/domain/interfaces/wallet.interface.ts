import { WalletType } from "../enums/wallet_type.enum";
import { InstructionDepositCrypto } from "../type/instruction_deposit_crypto.type";
import {
  InstructionDepositFiat,
  InstructionsAchPabType,
} from "../../../banking";
import { IClient } from "../../../client";
import { Asset } from "../../../asset";

export interface IWallet {
  getId(): string;

  getClient(): IClient;

  getClientId(): string;

  getWalletId(): string;

  toPrimitives(): any;

  getBalanceAvailable(): number;

  getBalance(): number;

  getLockedBalance(): number;

  getAsset(): Asset;

  getWalletType(): WalletType;

  getAccountId(): string;

  getIdentifierForInstructionOfDeposit(label: string): string;

  getInstructionForDeposit():
    | InstructionDepositCrypto
    | InstructionDepositFiat
    | InstructionsAchPabType;

  setNewBalance(balance: number, lockedBalance: number): IWallet;

  calculateNewBalance(balance: number, lockedBalance: number): IWallet;

  updateLockedBalance(amount: number): IWallet;

  releaseBlockedBalance(amount: number): IWallet;

  updateBalance(amount: number): IWallet;

  setInstructionForDeposit(
    data:
      | InstructionDepositCrypto
      | InstructionDepositFiat
      | InstructionsAchPabType,
  ): IWallet;

  setLockedBalance(lockedBalance: number): void;
}
