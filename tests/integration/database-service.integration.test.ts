import { DatabaseService } from "../../src/infrastructure/database-service";
import { ConfigService } from "../../src/config/config";

describe("Integration Test: DatabaseService", () => {
  let dbService: DatabaseService;
  let configService: ConfigService;

  beforeAll(() => {
    configService = new ConfigService({ batchSize: 2 });
    dbService = new DatabaseService(
      "bolt://localhost:7687",
      "neo4j",
      "test",
      configService,
    );
  });

  afterAll(async () => {
    await dbService.close();
  });

  it("should execute batch operations correctly", async () => {
    const queries = [
      {
        query: "CREATE (n:Person {name: $name})",
        parameters: { name: "Alice" },
      },
      { query: "CREATE (n:Person {name: $name})", parameters: { name: "Bob" } },
    ];

    await expect(dbService.executeBatch(queries)).resolves.not.toThrow();
    // Further validation with a query to check that nodes were created can be added here
  });
});
