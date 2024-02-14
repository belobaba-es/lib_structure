import { AssetMongoRepository, AssetTypeEnum } from "../../src";

describe("Assets", () => {
  it("Get all assets", async () => {
    const assets = await AssetMongoRepository.instance().find(
      true,
      AssetTypeEnum.STABLE,
    );

    console.log("assets", assets.length, assets);
    expect(assets.length).toBeGreaterThan(0);
  });
});
