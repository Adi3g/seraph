import { Node } from '../domain/Node';
import { Relationship } from '../domain/Relationship';

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
    // Convert properties to Cypher format
    const props = Object.entries(properties)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join(', ');
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
   * Builds the final Cypher query string.
   * @returns The constructed Cypher query.
   */
  build(): string {
    return this.query.join(' ');
  }
}
