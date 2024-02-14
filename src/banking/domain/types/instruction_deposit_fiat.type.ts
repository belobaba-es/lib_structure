export type InstructionDepositFiat = {
  id: string;
  label: string;
  WIRE: {
    holderName: string;
    accountNumber: string;
    accountRoutingNumber: string;
    bankName: string;
    memo: string;
    holderAddress: {
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
    institutionAddress: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
  };
  ACH: {
    holderName: string;
    accountNumber: string;
    accountRoutingNumber: string;
    memo: string;
  };
  SWIFT: {
    holderName: string;
    accountNumber: string;
    swiftBic: string;
    bankName: string;
    memo: string;
    holderAddress: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
    institutionAddress: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
  };
};
