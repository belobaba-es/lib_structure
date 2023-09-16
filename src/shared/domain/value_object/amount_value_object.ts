import { ValueObject } from "./value_object";
import { InvalidArgumentError } from "../exceptions/invalid_argument_error";

export class AmountValueObject extends ValueObject<number> {
  constructor(readonly value: any) {
    super(value);
    this.ensureValueIsPositive();
  }

  static create(value: number): AmountValueObject {
    return new AmountValueObject(value);
  }

  private ensureValueIsPositive(): void {
    if (this.value <= 0) {
      throw new InvalidArgumentError("Amount must be positive");
    }
  }

  getValue(): number {
    return Number(this.value);
  }
}
