import { QueryBuilder } from "../../src/core/query-builder";
import { Node } from "../../src/domain/node";
import { Relationship } from "../../src/domain/relationship";

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
