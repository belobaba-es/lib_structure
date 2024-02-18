import { InstructionDepositFiat } from "../types/instruction_deposit_fiat.type";
import { IClient } from "../../../client";
import { CounterpartyBank } from "../counterparty_bank";
import { InformationBankDTO } from "../types/information_bank.type";
import { Address, DepositInformation } from "../../../shared";
import { InformationIntermediaryBankDTO } from "../types/information_intermediary_bank.type";
import { WithdrawalPurpose } from "../../../withdrawal";
import { CounterpartyProfileType } from "../../../counterparty";
import { BankingRails } from "../banking_rails";

export interface IBankingService {
  searchDepositInformation(
    instructionDepositId: string,
    depositId: string,
  ): Promise<DepositInformation>;

  searchBankInstructionForDeposit(
    client: IClient,
    assetId: string,
  ): Promise<InstructionDepositFiat>;

  registerCounterpartyBank(
    client: IClient,
    informationOwner: {
      name: string;
      address: Address;
    },
    bankingRails: BankingRails,
    informationBank: InformationBankDTO,
    profileType: CounterpartyProfileType,
    informationIntermediaryBank?: InformationIntermediaryBankDTO,
  ): Promise<CounterpartyBank>;

  internalTransfer(
    sourceWalletId: string,
    destinationWalletId: string,
    amount: number,
    description?: string,
  ): Promise<string>;

  makeWithdrawal(
    sourceWalletId: string,
    amount: number,
    counterparty: CounterpartyBank,
    description: string,
    purpose: WithdrawalPurpose,
  ): Promise<string>;

  searchBalanceWallet(walletId: string): Promise<{
    current_balance: number;
    available_balance: number;
  }>;
}
