import { MongoClientFactory, MongoRepository } from "../../shared";
import { IDocumentRepository } from "../domain/interfaces/document_repository.interface";
import { MongoClient } from "mongodb";
import { Documents } from "../domain/documents";

export class DocumentMongoRepository
  extends MongoRepository<any>
  implements IDocumentRepository
{
  private static _instance: DocumentMongoRepository;

  public static instance(): DocumentMongoRepository {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new DocumentMongoRepository();
    return this._instance;
  }

  constructor() {
    super(MongoClientFactory.createClient());
  }

  collectionName(): string {
    return "clients";
  }

  async update(oldDocumentId: string, document: Documents): Promise<void> {
    const collection = await this.collection();
    const data = document.toPrimitives();

    await collection.updateOne(
      {
        clientId: document.getClientId(),
        "documents.documentId": oldDocumentId,
      },
      {
        $set: {
          "documents.$.patch": data.patch,
          "documents.$.clientId": data.clientId,
          "documents.$.documentType": data.documentType,
        },
      },
    );
  }

  async findDocumentByClientId(clientId: string): Promise<Documents[]> {
    const collection = await this.collection();
    const pipeline = [
      {
        $match: {
          clientId: clientId,
        },
      },
      {
        $project: {
          documents: 1,
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    if (result.length === 0) {
      return [];
    }

    return result[0].documents.map((document: any) => {
      return Documents.fromPrimitives({ clientId, ...document });
    });
  }

  async save(document: Documents): Promise<void> {
    const collection = await this.collection();

    await collection.updateOne(
      { clientId: document.getClientId() },
      {
        $set: {
          documents: document.toPrimitives(),
        },
      },
    );
  }
}
