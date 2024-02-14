import { AssetMongoRepository } from "../../src";

describe("Assets", () => {
  it("Get all assets", async () => {
    const assets = await AssetMongoRepository.instance().all();

    console.log("assets", assets);
  });
});
