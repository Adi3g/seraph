import { Node } from "../domain/node";
import { Relationship } from "../domain/relationship";
import { DatabaseService } from "../infrastructure/database-service";
/**
 * QueryBuilder is responsible for constructing Neo4j queries using a fluent API.
 */
export class QueryBuilder {
  private query: string[] = [];
  private parameters: Record<string, unknown> = {};
  private dbService: DatabaseService | null;

  /**
   * Initializes a new instance of the QueryBuilder class.
   * @param dbService An instance of DatabaseService for executing queries.
   */
  constructor(dbService: DatabaseService | null = null) {
    this.dbService = dbService; // Initialize DatabaseService
  }

  /**
   * Creates a new node in the graph.
   * @param node The node to be created.
   * @returns The current instance of QueryBuilder.
   */
  createNode(node: Node): QueryBuilder {
    const { label, properties } = node;
    const props = Object.entries(properties)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([key, _value]) => `${key}: $${key}`)
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
  build(): { query: string; parameters: Record<string, unknown> } {
    return { query: this.query.join(" "), parameters: this.parameters };
  }
  /**
   * Adds a parameterized MATCH clause.
   * @param pattern The pattern to match.
   * @param params The parameters for the query.
   * @returns The current instance of QueryBuilder.
   */
  matchWithParams(
    pattern: string,
    params: Record<string, unknown>,
  ): QueryBuilder {
    this.query.push(`MATCH ${pattern}`);
    this.addParameters(params);
    return this;
  }

  /**
   * Adds parameters to the query.
   * @param params Key-value pairs for query parameters.
   */
  private addParameters(params: Record<string, unknown>): void {
    // Store parameters for later use with the query execution
    this.parameters = { ...this.parameters, ...params };
  }

  /**
   * Adds an OPTIONAL MATCH clause to the query.
   * @param pattern The pattern to optionally match.
   * @returns The current instance of QueryBuilder.
   */
  optionalMatch(pattern: string): QueryBuilder {
    this.query.push(`OPTIONAL MATCH ${pattern}`);
    return this;
  }

  /**
   * Adds an UNWIND clause to the query to expand lists into rows.
   * @param list The list to unwind.
   * @param alias The alias for each element of the list.
   * @returns The current instance of QueryBuilder.
   */
  unwind(list: string, alias: string): QueryBuilder {
    this.query.push(`UNWIND ${list} AS ${alias}`);
    return this;
  }

  /**
   * Adds a MERGE clause to the query.
   * @param pattern The pattern to merge.
   * @returns The current instance of QueryBuilder.
   */
  merge(pattern: string): QueryBuilder {
    this.query.push(`MERGE ${pattern}`);
    return this;
  }

  /**
   * Adds an aggregation function to the query.
   * @param functionType The aggregation function (e.g., COUNT, SUM).
   * @param field The field to apply the aggregation function to.
   * @param alias Alias for the result of the aggregation.
   * @returns The current instance of QueryBuilder.
   */
  aggregate(
    functionType: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX",
    field: string,
    alias: string,
  ): QueryBuilder {
    this.query.push(`${functionType}(${field}) AS ${alias}`);
    return this;
  }

  /**
   * Adds a MATCH clause for paths with variable length relationships.
   * @param pattern The pattern with variable length (e.g., -[:RELTYPE*1..5]->).
   * @returns The current instance of QueryBuilder.
   */
  matchPath(pattern: string): QueryBuilder {
    this.query.push(`MATCH ${pattern}`);
    return this;
  }

  /**
   * Adds a GROUP BY clause to the query.
   * @param field The field to group by.
   * @returns The current instance of QueryBuilder.
   */
  groupBy(field: string): QueryBuilder {
    this.query.push(`WITH ${field}`);
    return this;
  }

  /**
   * Adds an aggregation function with grouping to the query.
   * @param functionType The aggregation function (e.g., COUNT, SUM).
   * @param field The field to apply the aggregation function to.
   * @param alias Alias for the result of the aggregation.
   * @returns The current instance of QueryBuilder.
   */
  aggregateWithGroup(
    functionType: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX",
    field: string,
    alias: string,
  ): QueryBuilder {
    this.query.push(`${functionType}(${field}) AS ${alias}`);
    return this;
  }

  /**
   * Executes the built query using the DatabaseService.
   * @returns The result of the query execution.
   */
  async execute(): Promise<unknown> {
    const { query, parameters } = this.build();
    if (!this.dbService) {
      throw new Error(
        "DatabaseService is not provided. Cannot execute the query.",
      );
    }
    try {
      return await this.dbService.executeQuery(query, parameters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Adds a nested subquery within the current query context.
   * @param subquery The subquery builder instance.
   * @param alias The alias for the subquery result.
   * @returns The current instance of QueryBuilder.
   */
  subquery(subquery: QueryBuilder, alias: string): QueryBuilder {
    const { query, parameters } = subquery.build();
    this.query.push(`CALL { ${query} } AS ${alias}`);
    this.parameters = { ...this.parameters, ...parameters };
    return this;
  }
}
