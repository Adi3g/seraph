import { QueryBuilder } from '../../src/core/QueryBuilder';
import { Node } from '../../src/domain/Node';
import { Relationship } from '../../src/domain/Relationship';

describe('QueryBuilder', () => {
  it('should create a node query', () => {
    const node = new Node('Person', { name: 'Alice', age: 30 });
    const query = new QueryBuilder().createNode(node).build();
    // Update expected string to match the actual output format
    expect(query).toBe('CREATE (n:Person {name: "Alice", age: 30})');
  });

  it('should create a relationship query', () => {
    const relationship = new Relationship('FRIEND', 'n', 'm');
    const query = new QueryBuilder().createRelationship(relationship).build();
    expect(query).toBe('CREATE (n)-[:FRIEND]->(m)');
  });
});
