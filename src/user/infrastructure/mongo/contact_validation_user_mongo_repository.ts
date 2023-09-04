import { MongoClientFactory, MongoRepository } from "../../../shared";
import { ValidateUserContact } from "../../domain/validate_user_contact";
import { IContactValidationUser } from "../../domain/interfaces/contact_validation_user.interface";
import { ContactValidationType } from "../../domain/enums/contact_validation_type";

export class ContactValidationUserMongoRepository
  extends MongoRepository<ValidateUserContact>
  implements IContactValidationUser
{
  constructor() {
    super(MongoClientFactory.createClient());
  }
  collectionName(): string {
    return "contact_validate_user";
  }

  async findByTypeAndUserId(
    typeValidation: ContactValidationType,
    userId: string,
  ): Promise<ValidateUserContact | undefined> {
    const collection = await this.collection();
    const result = await collection.findOne({
      type: typeValidation,
      userId: userId,
    });

    if (!result) {
      return undefined;
    }

    return ValidateUserContact.fromPrimitives(result._id.toString(), {
      ...result,
    });
  }

  async upsert(contactValidation: ValidateUserContact): Promise<void> {
    await this.persist(contactValidation.getId(), contactValidation);
  }
}