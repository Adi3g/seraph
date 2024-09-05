import { QueryBuilder } from "../../src/core/query-builder";

describe("QueryBuilder Complex Examples", () => {
  it("should create a query with advanced filtering, aggregation, and conditional logic", () => {
    const qb = new QueryBuilder();
    qb.match("(p:Person)-[r:FRIENDS_WITH]-(friend:Person)")
      .where("p.age > 25 AND friend.age > 25")
      .with("p, COUNT(friend) AS friendCount") // Ensure WITH is correctly placed
      .where("friendCount > 3")
      .return("p.name, friendCount")
      .orderBy("friendCount DESC")
      .limit(5);

    expect(qb.build().query).toBe(
      "MATCH (p:Person)-[r:FRIENDS_WITH]-(friend:Person) " +
        "WHERE p.age > 25 AND friend.age > 25 " +
        "WITH p, COUNT(friend) AS friendCount " +
        "WHERE friendCount > 3 " +
        "RETURN p.name, friendCount " +
        "ORDER BY friendCount DESC " +
        "LIMIT 5",
    );
  });

  it("should create a recursive path query with variable length relationships", () => {
    const qb = new QueryBuilder();
    qb.match("(p:Person)-[:KNOWS*1..5]->(friend:Person)")
      .where("p.name = $name")
      .return("friend.name, LENGTH((p)-[:KNOWS*1..5]->(friend)) AS pathLength")
      .orderBy("pathLength");

    expect(qb.build().query).toBe(
      "MATCH (p:Person)-[:KNOWS*1..5]->(friend:Person) " +
        "WHERE p.name = $name " +
        "RETURN friend.name, LENGTH((p)-[:KNOWS*1..5]->(friend)) AS pathLength " +
        "ORDER BY pathLength",
    );
  });

  it("should merge relationships with conditional logic", () => {
    const qb = new QueryBuilder();
    qb.match("(a:Person), (b:Person)")
      .where("a.name = $name1 AND b.name = $name2")
      .merge("(a)-[r:COLLABORATES_WITH]->(b)")
      .set("r.since = date()") // ON CREATE SET
      .set("r.meetings = coalesce(r.meetings, 0) + 1") // ON MATCH SET
      .return("a.name, b.name, r.since, r.meetings");

    expect(qb.build().query).toBe(
      "MATCH (a:Person), (b:Person) " +
        "WHERE a.name = $name1 AND b.name = $name2 " +
        "MERGE (a)-[r:COLLABORATES_WITH]->(b) " +
        "SET r.since = date() " +
        "SET r.meetings = coalesce(r.meetings, 0) + 1 " +
        "RETURN a.name, b.name, r.since, r.meetings",
    );
  });

});
