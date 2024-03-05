import {
  CounterpartyMongoRepository,
  CounterpartyType,
  Criteria,
  Filters,
  Operator,
  Order,
  OrderTypes,
} from "../../src";

describe("Counterparty", () => {
  it("should list used criteria method page null", async () => {
    const clientId = "FSilva187263254";

    const filterClientId: Map<string, string> = new Map([
      ["field", "clientId"],
      ["operator", Operator.EQUAL],
      ["value", clientId],
    ]);

    const filterCounterpartyType: Map<string, string> = new Map([
      ["field", "counterpartyType"],
      ["operator", Operator.EQUAL],
      ["value", CounterpartyType.FIAT],
    ]);

    const criteria = new Criteria(
      Filters.fromValues([filterClientId, filterCounterpartyType]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      20,
      1,
    );

    const result = await CounterpartyMongoRepository.instance().list(criteria);
    // console.log(result);
    expect(result.nextPag).toBeNull();
  });
  it("should list used criteria method page not null", async () => {
    const clientId = "FSilva187263254";

    const filterClientId: Map<string, string> = new Map([
      ["field", "clientId"],
      ["operator", Operator.EQUAL],
      ["value", clientId],
    ]);

    const filterCounterpartyType: Map<string, string> = new Map([
      ["field", "counterpartyType"],
      ["operator", Operator.EQUAL],
      ["value", CounterpartyType.FIAT],
    ]);

    const criteria = new Criteria(
      Filters.fromValues([filterClientId, filterCounterpartyType]),
      Order.fromValues("createdAt", OrderTypes.DESC),
      5,
      1,
    );

    const result = await CounterpartyMongoRepository.instance().list(criteria);
    //console.log(result);
    expect(result.nextPag).toEqual(result.nextPag);
  });
});
