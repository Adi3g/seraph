import { Node } from "../domain/node";
import { Relationship } from "../domain/relationship";

/**
 * QueryBuilder is responsible for constructing Neo4j queries using a fluent API.
 */
export class QueryBuilder {
  private query: string[] = [];
  private parameters: Record<string, any> = {};

  /**
   * Creates a new node in the graph.
   * @param node The node to be created.
   * @returns The current instance of QueryBuilder.
   */
  createNode(node: Node): QueryBuilder {
    const { label, properties } = node;
    const props = Object.entries(properties)
      .map(([key, value]) => `${key}: $${key}`)
      .join(", ");
    this.parameters = { ...this.parameters, ...properties };
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
   * Builds the final Cypher query string along with parameters.
   * @returns An object containing the constructed Cypher query and its parameters.
   */
  build(): { query: string; parameters: Record<string, any> } {
    return { query: this.query.join(" "), parameters: this.parameters };
  }
  /**
   * Adds a parameterized MATCH clause.
   * @param pattern The pattern to match.
   * @param params The parameters for the query.
   * @returns The current instance of QueryBuilder.
   */
  matchWithParams(pattern: string, params: Record<string, any>): QueryBuilder {
    this.query.push(`MATCH ${pattern}`);
    this.addParameters(params);
    return this;
  }

  /**
   * Adds parameters to the query.
   * @param params Key-value pairs for query parameters.
   */
  private addParameters(params: Record<string, any>): void {
    // Store parameters for later use with the query execution
    this.parameters = { ...this.parameters, ...params };
  }
}
