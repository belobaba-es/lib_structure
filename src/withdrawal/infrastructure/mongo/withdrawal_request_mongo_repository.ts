import {
  Criteria,
  Filters,
  MongoClientFactory,
  MongoRepository,
  Operator,
  Order,
  OrderTypes,
  Paginate,
} from "../../../shared";
import { IWithdrawalRequestRepository } from "../../domain/interfaces/withdrawal_request.interface";
import { WithdrawalRequest } from "../../domain/withdrawal_request";
import {
  Counterparty,
  CounterpartyMongoRepository,
} from "../../../counterparty";
import { logger } from "../../../index";

export class WithdrawalRequestMongoRepository
  extends MongoRepository<WithdrawalRequest>
  implements IWithdrawalRequestRepository
{
  private static _instance: WithdrawalRequestMongoRepository;

  constructor() {
    super(MongoClientFactory.createClient());
  }

  static instance(): WithdrawalRequestMongoRepository {
    if (!WithdrawalRequestMongoRepository._instance) {
      WithdrawalRequestMongoRepository._instance =
        new WithdrawalRequestMongoRepository();
    }
    return WithdrawalRequestMongoRepository._instance;
  }

  collectionName(): string {
    return "withdrawal_requests";
  }

  async findByClient(
    clientId: string,
    page = 1,
    perPage = 20,
  ): Promise<Paginate<WithdrawalRequest>> {
    const filterClientId: Map<string, string> = new Map([
      ["field", "clientId"],
      ["operator", Operator.EQUAL],
      ["value", clientId],
    ]);

    const criteria: Criteria = new Criteria(
      Filters.fromValues([filterClientId]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      perPage,
      page,
    );

    return await this.list(criteria);
  }

  async list(criteria: Criteria): Promise<Paginate<WithdrawalRequest>> {
    const document = await this.searchByCriteria<WithdrawalRequest>(criteria);

    return this.buildPaginate<WithdrawalRequest>(document);
  }

  async upsert(withdrawal: WithdrawalRequest): Promise<void> {
    logger.info(
      `solicitud de transferencia DB ${withdrawal.getId()} ${JSON.stringify(
        withdrawal.toPrimitives(),
      )}`,
    );
    await this.persist(withdrawal.getId(), withdrawal);
  }

  async findByWithdrawalId(withdrawalId: string): Promise<WithdrawalRequest> {
    const collection = await this.collection();
    const result = await collection.findOne({ withdrawalId });
    if (!result) {
      return undefined;
    }

    const counterparty: Counterparty =
      await CounterpartyMongoRepository.instance().findByCounterpartyIdAndAssetId(
        result.counterparty.counterpartyId,
        result.counterparty.assetId,
      );

    return WithdrawalRequest.fromPrimitives(
      result._id.toString(),
      result,
      counterparty,
    );
  }
}
