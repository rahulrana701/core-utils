import { z } from "zod";

import { expectToBeError, expectToBeSuccess } from "../../test";
import { booleanString } from "../schemas";
import { createFilter } from "./createFilter";

describe("createFilter", () => {
  const filterSchema = z.object(
    createFilter({
      age: {
        filters: ["eq", "ne", "gt", "gte", "lt", "lte", "not"],
        schema: z.coerce.number().int().positive(),
      },
      dateOfBirth: {
        filters: ["gte"],
        schema: z.coerce.date().min(new Date("1900-01-01")),
      },
      isActive: {
        filters: ["eq"],
        schema: booleanString,
      },
      name: {
        filters: ["eq", "ne"],
        schema: z.string(),
      },
    }),
  );

  it("accepts valid filters", () => {
    const input = {
      filter: {
        age: {
          eq: "30",
          gt: "25",
          lte: "40",
        },
        dateOfBirth: {
          gte: "1990-01-01",
        },
        name: {
          eq: "Alice",
        },
        isActive: {
          eq: "true",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeSuccess(actual);
    expect(actual.data).toEqual({
      filter: {
        age: {
          eq: [30],
          gt: [25],
          lte: [40],
        },
        dateOfBirth: {
          gte: [new Date("1990-01-01")],
        },
        name: {
          eq: ["Alice"],
        },
        isActive: {
          eq: [true],
        },
      },
    });
  });

  it("rejects invalid filter types", () => {
    const input = {
      filter: {
        age: {
          eq: "invalid",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeError(actual);
    expect(actual.error.message).toContain("Expected number, received nan");
  });

  it("rejects invalid filter type", () => {
    const input = {
      filter: {
        age: {
          invalid: "30",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeError(actual);
    expect(actual.error.message).toContain("Unrecognized key(s) in object: 'invalid'");
  });

  it("rejects unknown API type", () => {
    const input = {
      filter: {
        invalid: {
          eq: "30",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeError(actual);
    expect(actual.error.message).toContain("Unrecognized key(s) in object: 'invalid'");
  });

  it("allows omitting filters and API types", () => {
    const input = {
      filter: {
        age: {
          eq: "30",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeSuccess(actual);
    expect(actual.data).toEqual({
      filter: {
        age: {
          eq: [30],
        },
      },
    });
  });

  it("parses comma-separated string input", () => {
    const input = {
      filter: {
        age: {
          eq: "30,40",
          gt: "25",
        },
        name: {
          eq: "Alice,Bob",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeSuccess(actual);
    expect(actual.data).toEqual({
      filter: {
        age: {
          eq: [30, 40],
          gt: [25],
        },
        name: {
          eq: ["Alice", "Bob"],
        },
      },
    });
  });

  it("handles single value as eq filter", () => {
    const input = {
      filter: {
        age: "30",
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeSuccess(actual);
    expect(actual.data).toEqual({
      filter: {
        age: {
          eq: [30],
        },
      },
    });
  });

  it("handles mixed single value and object filters", () => {
    const input = {
      filter: {
        age: {
          "30": true,
          gt: "25",
        },
      },
    };

    const actual = filterSchema.safeParse(input);

    expectToBeSuccess(actual);
    expect(actual.data).toEqual({
      filter: {
        age: {
          eq: [30],
          gt: [25],
        },
      },
    });
  });

  it("allows empty object", () => {
    const actual = filterSchema.safeParse({});

    expectToBeSuccess(actual);
  });
});