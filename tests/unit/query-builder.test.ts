import { QueryBuilder } from "../../src/core/query-builder";
import { Node } from "../../src/domain/node";
import { Relationship } from "../../src/domain/relationship";

describe("QueryBuilder", () => {
  it("should create a node query", () => {
    const node = new Node("Person", { name: "Alice", age: 30 });
    const query = new QueryBuilder().createNode(node).build();
    expect(query).toBe('CREATE (n:Person {name: "Alice", age: 30})');
  });

  it("should create a relationship query", () => {
    const relationship = new Relationship("FRIEND", "n", "m");
    const query = new QueryBuilder().createRelationship(relationship).build();
    expect(query).toBe("CREATE (n)-[:FRIEND]->(m)");
  });

  it("should add a MATCH clause to the query", () => {
    const query = new QueryBuilder().match("(n:Person)").build();
    expect(query).toBe("MATCH (n:Person)");
  });

  it("should add a WHERE clause to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Person)")
      .where("n.age > 30")
      .build();
    expect(query).toBe("MATCH (n:Person) WHERE n.age > 30");
  });

  it("should add a RETURN clause to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Person)")
      .return("n.name, n.age")
      .build();
    expect(query).toBe("MATCH (n:Person) RETURN n.name, n.age");
  });

  it("should add a SET clause to the query", () => {
    const query = new QueryBuilder()
      .match("(n:Person)")
      .set("n.age = 31")
      .build();
    expect(query).toBe("MATCH (n:Person) SET n.age = 31");
  });

  it("should add a DELETE clause to the query", () => {
    const query = new QueryBuilder().match("(n:Person)").delete("n").build();
    expect(query).toBe("MATCH (n:Person) DELETE n");
  });
});