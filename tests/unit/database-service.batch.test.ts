import { DatabaseService } from "../../src/infrastructure/database-service";

jest.mock("neo4j-driver", () => ({
  driver: jest.fn().mockReturnValue({
    session: jest.fn().mockReturnValue({
      run: jest.fn().mockResolvedValue({
        records: [{ toObject: () => ({ name: "Alice" }) }],
      }),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
  auth: { basic: jest.fn() },
}));

describe("DatabaseService with Caching", () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = new DatabaseService(
      "bolt://localhost:7687",
      "neo4j",
      "password",
    );
  });

  afterEach(async () => {
    await dbService.close();
  });

  it("should cache query results and return cached data on repeated queries", async () => {
    const query = "MATCH (n:Person) RETURN n.name";
    const parameters = {};
    const firstResult = await dbService.executeQuery(query, parameters);
    const secondResult = await dbService.executeQuery(query, parameters);

    expect(firstResult).toEqual([{ name: "Alice" }]);
    expect(secondResult).toEqual([{ name: "Alice" }]);
    expect(dbService["cache"].size).toBe(1); // Cache should contain one entry
  });

  it("should clear the cache", () => {
    dbService.clearCache();
    expect(dbService["cache"].size).toBe(0);
  });
});
