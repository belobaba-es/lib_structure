import { ValueObject } from "./value_object";
import { InvalidArgumentError } from "../exceptions/invalid_argument_error";

export class StringValueObject extends ValueObject<string> {
  constructor(readonly value: any) {
    super(value);
    this.ensureStringIsNotEmpty();
  }

  static create(value: string): StringValueObject {
    return new StringValueObject(value);
  }

  private ensureStringIsNotEmpty(): void {
    if (this.value.length < 1) {
      throw new InvalidArgumentError("String should have a length");
    }
  }

  getValue(): string {
    return String(this.value);
  }
}
