import { Node } from '../domain/node';
import { Relationship } from '../domain/relationship';

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
    const props = JSON.stringify(properties).replace(/"(\w+)"\s*:/g, '$1:');
    this.query.push(`CREATE (n:${label} ${props})`);
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
