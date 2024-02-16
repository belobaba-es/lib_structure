import { SystemConfigurationMongoRepository } from "../../src";

describe("System config", () => {
  it("feeWire", async () => {
    const feeWire =
      await SystemConfigurationMongoRepository.instance().getDefaultFeeWire();

    console.log("feeWire", feeWire);
  });

  it("Should get fees for ACH Panama", async () => {
    const feeACHPAB =
      await SystemConfigurationMongoRepository.instance().getDefaultFeeACHPAB();

    console.log("feeACHPAB", feeACHPAB.out);
    console.log("feeACHPAB", feeACHPAB.getFeeOut());
  });
});
