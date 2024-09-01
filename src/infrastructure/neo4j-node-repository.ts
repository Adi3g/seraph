import { NodeRepository } from "domain/repository/node-repository";
import { Node } from "../domain/node";
import neo4j, { Driver, Session } from "neo4j-driver";

export class Neo4jNodeRepository implements NodeRepository {
  private driver: Driver;

  constructor(uri: string, user: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async create(node: Node): Promise<void> {
    const session: Session = this.driver.session();
    try {
      const { label, properties } = node;
      const props = JSON.stringify(properties).replace(/"(\w+)"\s*:/g, "$1:");
      await session.run(`CREATE (n:${label} ${props})`);
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<Node | null> {
    // Implement method to find node by ID
    return null;
  }

  // Additional methods as needed
}
