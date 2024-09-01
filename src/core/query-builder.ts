import { Node } from "../domain/node";
import { Relationship } from "../domain/relationship";

/**
 * QueryBuilder is responsible for constructing Neo4j queries using a fluent API.
 */
export class QueryBuilder {
  private query: string[] = [];

  /**
   * Creates a new node in the graph.
   * @param node The node to be created.
   * @returns The current instance of QueryBuilder.
   */
  createNode(node: Node): QueryBuilder {
    const { label, properties } = node;
    const props = Object.entries(properties)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === "string" ? `"${value}"` : value}`,
      )
      .join(", ");
    this.query.push(`CREATE (n:${label} {${props}})`);
    return this;
  }

  /**
   * Creates a new relationship between two nodes.
   * @param relationship The relationship to be created.
   * @returns The current instance of QueryBuilder.
   */
  createRelationship(relationship: Relationship): QueryBuilder {
    const { type, from, to } = relationship;
    this.query.push(`CREATE (${from})-[:${type}]->(${to})`);
    return this;
  }

  /**
   * Adds a MATCH clause to the query.
   * @param pattern The pattern to match.
   * @returns The current instance of QueryBuilder.
   */
  match(pattern: string): QueryBuilder {
    this.query.push(`MATCH ${pattern}`);
    return this;
  }

  /**
   * Adds a WHERE clause to the query.
   * @param condition The condition to filter the match.
   * @returns The current instance of QueryBuilder.
   */
  where(condition: string): QueryBuilder {
    this.query.push(`WHERE ${condition}`);
    return this;
  }

  /**
   * Adds a RETURN clause to the query.
   * @param items The items to return.
   * @returns The current instance of QueryBuilder.
   */
  return(items: string): QueryBuilder {
    this.query.push(`RETURN ${items}`);
    return this;
  }

  /**
   * Adds a SET clause to the query to update properties.
   * @param updates The properties to update.
   * @returns The current instance of QueryBuilder.
   */
  set(updates: string): QueryBuilder {
    this.query.push(`SET ${updates}`);
    return this;
  }

  /**
   * Adds a DELETE clause to the query.
   * @param target The node or relationship to delete.
   * @returns The current instance of QueryBuilder.
   */
  delete(target: string): QueryBuilder {
    this.query.push(`DELETE ${target}`);
    return this;
  }

  /**
   * Builds the final Cypher query string.
   * @returns The constructed Cypher query.
   */
  build(): string {
    return this.query.join(" ");
  }
}
