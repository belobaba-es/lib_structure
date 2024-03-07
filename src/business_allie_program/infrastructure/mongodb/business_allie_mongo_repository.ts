import { IBusinessAllieRepository } from "../../interfaces/business_allie_repository.interface";
import { BusinessAllieDTO } from "../../type/business_allie.type";
import { BusinessAllie } from "../../business_allie";
import { BusinessOpportunityDTO } from "../../type/business_opportunity.type";
import { BusinessOpportunity } from "../../business_opportunity";
import { MongoClientFactory, MongoRepository } from "../../../shared";

export class BusinessAllieMongoRepository
  extends MongoRepository<BusinessAllie>
  implements IBusinessAllieRepository
{
  constructor() {
    super(MongoClientFactory.createClient());
  }
  collectionName(): string {
    return "business_allie";
  }
  private static _instance: BusinessAllieMongoRepository;

  static instance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new BusinessAllieMongoRepository();
    return this._instance;
  }
  async getBusinessAllie(
    clientId: string,
  ): Promise<BusinessAllieDTO | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne({ clientId });

    if (!result) {
      return undefined;
    }

    return { ...result, id: result._id } as unknown as BusinessAllieDTO;
  }

  async saveBusinessAllie(businessAllie: BusinessAllie): Promise<void> {
    await this.persist(businessAllie.getId(), businessAllie);
  }

  async addOpportunityToAllie(
    clientId: string,
    opportunityPayload: BusinessOpportunityDTO,
  ): Promise<BusinessAllieDTO | null> {
    const collection = await this.collection();

    await collection.updateOne(
      { clientId },
      { $set: { businessOpportunities: opportunityPayload } },
      { upsert: true },
    );

    return (await collection.findOne({
      clientId,
    })) as unknown as BusinessAllieDTO;
  }

  async updateBusinessOpportunityData(
    opportunity: BusinessOpportunity,
  ): Promise<void> {
    const collection = await this.collection();

    await collection.updateOne(
      {
        clientId: opportunity.getClientIdToBusinessAllie(),
        "businessOpportunities.taxId": opportunity.getTaxId(),
      },
      {
        $set: {
          ...this.transformationToUpsertInSubDocuments(
            "businessOpportunities",
            opportunity.toPrimitives(),
          ),
        },
      },
    );
  }

  async getOpportunityAndAllieByTaxId(
    taxId: string,
  ): Promise<BusinessAllieDTO | null> {
    const collection = await this.collection();

    return (await collection.findOne({
      "businessOpportunities.taxId": taxId,
    })) as unknown as BusinessAllieDTO;
  }

  async getBusinessAllieByOpportunityClientId(
    clientId: string,
  ): Promise<BusinessAllieDTO | null> {
    const collection = await this.collection();

    return (await collection.findOne({
      "businessOpportunities.clientId": clientId,
    })) as unknown as BusinessAllieDTO;
  }

  async getAllieOpportunitiesByClientId(
    clientId: string,
  ): Promise<BusinessAllieDTO[] | null> {
    const collection = await this.collection();
    const result = await collection.findOne({ clientId });
    if (!result) {
      return null;
    }

    return result.businessOpportunities;
  }

  async getOpportunityByTaxId(
    taxId: string,
  ): Promise<BusinessOpportunity | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne(
      { "businessOpportunities.taxId": taxId },
      { projection: { "businessOpportunities.$": 1 } },
    );

    if (!result) {
      return undefined;
    }

    const opportunity = result.businessOpportunities[0];

    return new BusinessOpportunity({ ...opportunity, id: opportunity._id });
  }

  async getOpportunityByClientId(
    clientId: string,
  ): Promise<BusinessOpportunity | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne(
      { "businessOpportunities.clientId": clientId },
      { projection: { "businessOpportunities.$": 1 } },
    );

    if (!result) {
      return undefined;
    }

    const opportunity = result.businessOpportunities[0];

    return new BusinessOpportunity({ ...opportunity, id: opportunity._id });
  }
}
