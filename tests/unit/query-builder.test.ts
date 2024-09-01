import { QueryBuilder } from "../../src/core/query-builder";
import { Node } from "../../src/domain/node";
import { Relationship } from "../../src/domain/relationship";
import { DatabaseService } from "../../src/infrastructure/database-service";

describe("QueryBuilder", () => {
  it("should create a node query", () => {
    const node = new Node("Person", { name: "Alice", age: 30 });
    const { query } = new QueryBuilder().createNode(node).build();
    expect(query).toBe("CREATE (n:Person {name: $name, age: $age})");
  });

  it("should create a relationship query", () => {
    const relationship = new Relationship("FRIEND", "n", "m");
    const { query } = new QueryBuilder()
      .createRelationship(relationship)
      .build();
    expect(query).toBe("CREATE (n)-[:FRIEND]->(m)");
  });

  it("should add a MATCH clause to the query", () => {
    const { query } = new QueryBuilder().match("(n:Person)").build();
    expect(query).toBe("MATCH (n:Person)");
  });

  it("should add a WHERE clause to the query", () => {
    const { query } = new QueryBuilder()
      .match("(n:Person)")
      .where("n.age > 30")
      .build();
    expect(query).toBe("MATCH (n:Person) WHERE n.age > 30");
  });

  it("should add a RETURN clause to the query", () => {
    const { query } = new QueryBuilder()
      .match("(n:Person)")
      .return("n.name, n.age")
      .build();
    expect(query).toBe("MATCH (n:Person) RETURN n.name, n.age");
  });

  it("should add a SET clause to the query", () => {
    const { query } = new QueryBuilder()
      .match("(n:Person)")
      .set("n.age = 31")
      .build();
    expect(query).toBe("MATCH (n:Person) SET n.age = 31");
  });

  it("should add a DELETE clause to the query", () => {
    const { query } = new QueryBuilder()
      .match("(n:Person)")
      .delete("n")
      .build();
    expect(query).toBe("MATCH (n:Person) DELETE n");
  });
});

describe("QueryBuilder with Parameterized Queries", () => {
  it("should create a node query with parameters", () => {
    const node = new Node("Person", { name: "Alice", age: 30 });
    const result = new QueryBuilder().createNode(node).build();
    expect(result.query).toBe("CREATE (n:Person {name: $name, age: $age})");
    expect(result.parameters).toEqual({ name: "Alice", age: 30 });
  });
});

describe("QueryBuilder with OPTIONAL MATCH", () => {
  it("should add an OPTIONAL MATCH clause to the query", () => {
    const query = new QueryBuilder()
      .optionalMatch("(n:Person {name: $name})")
      .return("n")
      .build();
    expect(query.query).toBe(
      "OPTIONAL MATCH (n:Person {name: $name}) RETURN n",
    );
  });
});

describe("QueryBuilder with UNWIND", () => {
  it("should add an UNWIND clause to the query", () => {
    const query = new QueryBuilder()
      .unwind("$names", "name")
      .return("name")
      .build();
    expect(query.query).toBe("UNWIND $names AS name RETURN name");
  });
});

describe("QueryBuilder with MERGE", () => {
  it("should add a MERGE clause to the query", () => {
    const query = new QueryBuilder().merge("(n:Person {name: $name})").build();
    expect(query.query).toBe("MERGE (n:Person {name: $name})");
  });
});

describe("QueryBuilder with Aggregation Functions", () => {
  it("should add a COUNT aggregation to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Person)")
      .aggregate("COUNT", "n", "total")
      .build();
    expect(query.query).toBe("MATCH (n:Person) COUNT(n) AS total");
  });

  it("should add a SUM aggregation to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Transaction)")
      .aggregate("SUM", "n.amount", "totalAmount")
      .build();
    expect(query.query).toBe(
      "MATCH (n:Transaction) SUM(n.amount) AS totalAmount",
    );
  });
});

describe("QueryBuilder with Path Queries", () => {
  it("should add a path query with variable length relationship", () => {
    const query = new QueryBuilder()
      .matchPath("(a:Person)-[:KNOWS*1..5]->(b:Person)")
      .return("b")
      .build();
    expect(query.query).toBe(
      "MATCH (a:Person)-[:KNOWS*1..5]->(b:Person) RETURN b",
    );
  });
});

describe("QueryBuilder with Grouping and Aggregation", () => {
  it("should add GROUP BY and aggregation functions to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Person)")
      .groupBy("n.age")
      .aggregateWithGroup("COUNT", "n", "total")
      .return("n.age, total")
      .build();
    expect(query.query).toBe(
      "MATCH (n:Person) WITH n.age COUNT(n) AS total RETURN n.age, total",
    );
  });
});

jest.mock("../../src/infrastructure/database-service"); // Mock the DatabaseService

const MockedDatabaseService = DatabaseService as jest.MockedClass<
  typeof DatabaseService
>;

describe("QueryBuilder with DatabaseService", () => {
  let dbService: DatabaseService;
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    dbService = new MockedDatabaseService(
      "bolt://localhost:7687",
      "neo4j",
      "password",
    );
    queryBuilder = new QueryBuilder(dbService);
  });

  it("should execute a query using the DatabaseService", async () => {
    const mockResult = [{ name: "Alice", age: 30 }];
    dbService.executeQuery = jest.fn().mockResolvedValue(mockResult); // Mock executeQuery

    const node = new Node("Person", { name: "Alice", age: 30 });
    queryBuilder.createNode(node);
    const result = await queryBuilder.execute();

    expect(dbService.executeQuery).toHaveBeenCalledWith(
      "CREATE (n:Person {name: $name, age: $age})",
      { name: "Alice", age: 30 },
    );
    expect(result).toEqual(mockResult);
  });
});

describe("QueryBuilder Build Only", () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder(); // No DatabaseService provided
  });

  it("should build a query without executing", () => {
    queryBuilder.match("(n:Person)").where("n.age > 30").return("n.name");
    const { query, parameters } = queryBuilder.build();
    expect(query).toBe("MATCH (n:Person) WHERE n.age > 30 RETURN n.name");
    expect(parameters).toEqual({});
  });

  it("should throw an error when executing without DatabaseService", async () => {
    queryBuilder.match("(n:Person)").where("n.age > 30").return("n.name");
    await expect(queryBuilder.execute()).rejects.toThrow(
      "DatabaseService is not provided. Cannot execute the query.",
    );
  });
});

describe("QueryBuilder with Nested Queries", () => {
  it("should add a nested subquery", () => {
    const subquery = new QueryBuilder()
      .match("(m:Movie)")
      .where("m.released > 2000")
      .return("m.title");

    const queryBuilder = new QueryBuilder()
      .match("(n:Person)")
      .subquery(subquery, "recentMovies")
      .return("n.name, recentMovies");

    const { query, parameters } = queryBuilder.build();
    expect(query).toBe(
      "MATCH (n:Person) CALL { MATCH (m:Movie) WHERE m.released > 2000 RETURN m.title } AS recentMovies RETURN n.name, recentMovies",
    );
    expect(parameters).toEqual({});
  });
});

describe("QueryBuilder with Index", () => {
  it("should create an index on a node property", () => {
    const queryBuilder = new QueryBuilder().createIndex("Person", "name");
    const { query } = queryBuilder.build();
    expect(query).toBe("CREATE INDEX ON :Person(name)");
  });

  it("should drop an index on a node property", () => {
    const queryBuilder = new QueryBuilder().dropIndex("Person", "name");
    const { query } = queryBuilder.build();
    expect(query).toBe("DROP INDEX ON :Person(name)");
  });
});
