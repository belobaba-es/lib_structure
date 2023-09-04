import { DomainException } from "../../../shared";

export class UserFound extends DomainException {
  name = "user_exists";

  constructor(email: string) {
    super();
    this.message = `The email ${email} is already registered on the platform.`;
  }
}
