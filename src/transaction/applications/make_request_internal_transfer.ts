import {
  Counterparty,
  ICounterpartyRepository,
  RegisterOrSearchCounterpartyInternal,
} from "../../counterparty";
import {
  IWithdrawalRequestRepository,
  WithdrawalRequest,
  WithdrawalType,
} from "../../withdrawal";
import { Asset, IAssetRepository } from "../../asset";
import {
  IWalletRepository,
  UpdateLockedBalanceWallet,
  ValidateBalance,
} from "../../wallet";
import { FindByClientId, IClient, IClientRepository } from "../../client";
import { AmountValueObject } from "../../shared";
import { logger } from "../../index";

export class MakeRequestInternalTransfer {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly assetRepository: IAssetRepository,
    private readonly withdrawalRequest: IWithdrawalRequestRepository,
    private readonly counterpartyRepository: ICounterpartyRepository,
  ) {}

  /**
   *
   * @param clientIdOrigin Es el cliente que va a realizar la transferencia
   * @param clientIdDestination Es el cliente que va a recibir la transferencia
   * @param amount
   * @param assetCode
   * @param reference
   */
  async run(
    clientIdOrigin: string,
    clientIdDestination: string,
    amount: number,
    assetCode: string,
    reference: string,
  ): Promise<string> {
    logger.info(
      `Iniciando la transferencia interna origin: ${clientIdOrigin} destino: clientIdDestination ${clientIdDestination}, monto: ${amount} assetCode: ${assetCode} referencia: ${reference}`,
    );
    const clientOrigin: IClient = await new FindByClientId(
      this.clientRepository,
    ).run(clientIdOrigin);

    const clientDestination: IClient = await new FindByClientId(
      this.clientRepository,
    ).run(clientIdDestination);

    const asset: Asset = await this.assetRepository.findAssetByCode(assetCode);

    const counterparty: Counterparty =
      await new RegisterOrSearchCounterpartyInternal(
        this.walletRepository,
        this.counterpartyRepository,
      ).run(clientOrigin, clientDestination, asset);

    logger.info(
      `Counterparty para la transferencia interna ${assetCode} ${JSON.stringify(
        counterparty,
      )}`,
    );
    await new ValidateBalance(this.walletRepository).run(
      clientIdOrigin,
      amount,
      asset.getAssetId(),
    );

    const withdrawalRequest: WithdrawalRequest =
      WithdrawalRequest.createNewWithdrawalRequest(
        clientOrigin,
        counterparty,
        AmountValueObject.create(amount),
        reference,
        WithdrawalType.INTERNAL,
      );
    logger.info(
      `solicitud de transferencia creada ${JSON.stringify(withdrawalRequest)}`,
    );

    await this.withdrawalRequest.upsert(withdrawalRequest);
    logger.info(
      `id de la solicitud de la transferencia  ${withdrawalRequest.getWithdrawalId()}`,
    );

    await new UpdateLockedBalanceWallet(this.walletRepository).run(
      clientOrigin.getClientId(),
      asset.getAssetId(),
      amount,
    );

    return withdrawalRequest.getWithdrawalId();
  }
}
