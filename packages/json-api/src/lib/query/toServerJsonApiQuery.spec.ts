import { type ServerJsonApiQuery } from "../types";
import { toServerJsonApiQuery } from "./toServerJsonApiQuery";

const BASE_URL = "https://google.com";

describe("toJsonApiQuery", () => {
  it("returns empty object if no matches", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?hi=there`).searchParams)).toEqual({});
  });

  it("parses fields", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?fields[dog]=age`).searchParams)).toEqual({
      fields: { dog: ["age"] },
    });
  });

  it("parses multiple fields", () => {
    expect(
      toServerJsonApiQuery(new URL(`${BASE_URL}?fields[dog]=age&fields[vet]=name`).searchParams),
    ).toEqual({
      fields: { dog: ["age"], vet: ["name"] },
    });
  });

  it("parses fields with multiple values", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?fields[dog]=age,name`).searchParams)).toEqual({
      fields: { dog: ["age", "name"] },
    });
  });

  it("parses filter", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?filter[name]=snoopy`).searchParams)).toEqual({
      filter: { name: { eq: ["snoopy"] } },
    });
  });

  it("parses multiple filters", () => {
    expect(
      toServerJsonApiQuery(new URL(`${BASE_URL}?filter[name]=snoopy&filter[age]=2`).searchParams),
    ).toEqual({
      filter: { age: { eq: ["2"] }, name: { eq: ["snoopy"] } },
    });
  });

  it("parses filters with multiple values", () => {
    expect(
      toServerJsonApiQuery(new URL(`${BASE_URL}?filter[name]=snoopy,lassie`).searchParams),
    ).toEqual({
      filter: { name: { eq: ["snoopy", "lassie"] } },
    });
  });

  it("parses multiple filter types", () => {
    expect(
      toServerJsonApiQuery(
        new URL(
          `${BASE_URL}?filter[age][gt]=2&filter[age][gte]=3&filter[age][lt]=6&filter[age][lte]=5&filter[age][not]=4`,
        ).searchParams,
      ),
    ).toEqual({
      filter: { age: { gt: ["2"], gte: ["3"], lt: ["6"], lte: ["5"], not: ["4"] } },
    });
  });

  it("parses include", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?include=owner`).searchParams)).toEqual({
      include: ["owner"],
    });
  });

  it("parses include with multiple values", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?include=owner,vet`).searchParams)).toEqual({
      include: ["owner", "vet"],
    });
  });

  it("parses page", () => {
    expect(
      toServerJsonApiQuery(new URL(`${BASE_URL}?page[size]=10&page[cursor]=a2c12`).searchParams),
    ).toEqual({
      page: {
        cursor: "a2c12",
        size: "10",
      },
    });
  });

  it("parses limit/offset page", () => {
    expect(
      toServerJsonApiQuery(
        new URL(`${BASE_URL}?page[limit]=10&page[number]=2&page[offset]=20`).searchParams,
      ),
    ).toEqual({
      page: {
        limit: "10",
        number: "2",
        offset: "20",
      },
    });
  });

  it("parses sort", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?sort=age`).searchParams)).toEqual({
      sort: ["age"],
    });
  });

  it("parses sort with multiple values", () => {
    expect(toServerJsonApiQuery(new URL(`${BASE_URL}?sort=age,-name`).searchParams)).toEqual({
      sort: ["age", "-name"],
    });
  });

  it("parses combinations", () => {
    const [date1, date2] = ["2024-01-01", "2024-01-02"];
    const expected: ServerJsonApiQuery = {
      fields: { dog: ["name", "age"] },
      filter: {
        age: { eq: ["2"] },
        createdAt: { gt: [date1], lt: [date2] },
        isGoodDog: { eq: ["true"] },
      },
      include: ["owner"],
      page: {
        size: "10",
      },
      sort: ["-age"],
    };

    expect(
      toServerJsonApiQuery(
        new URL(
          `${BASE_URL}?fields[dog]=name,age&filter[age]=2&filter[createdAt][gt]=${date1}&filter[createdAt][lt]=${date2}&filter[isGoodDog]=true&include=owner&page[size]=10&sort=-age`,
        ).searchParams,
      ),
    ).toEqual(expected);
  });
});