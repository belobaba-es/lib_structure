import {
  ContactValidationType,
  ContactValidationUserMongoRepository,
  StringValueObject,
  User,
  UserMongoRepository,
  ValidateUserContact,
} from "../../src";

describe("Contact Validation User", () => {
  it("Create Contact Validation User type: phone", async () => {
    const user: User =
      await UserMongoRepository.instance().findByEmail("angel@angel.com");

    const userIdValue = StringValueObject.create(user.getUserId());

    const validate = ValidateUserContact.generateCodeForValidation(
      userIdValue.value,
      ContactValidationType.VALIDATE_EMAIL,
    );

    const existsPhoneCode =
      await ContactValidationUserMongoRepository.instance().findByTypeAndUserId(
        ContactValidationType.VALIDATE_PHONE,
        userIdValue.value,
      );

    await ContactValidationUserMongoRepository.instance().upsert(validate);

    // expect().not.toBe(undefined)
  });
});
