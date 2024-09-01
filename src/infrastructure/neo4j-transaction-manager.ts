// src/infrastructure/Neo4jTransactionManager.ts

import neo4j, { Driver, Session, Transaction } from "neo4j-driver";

export class Neo4jTransactionManager {
  private driver: Driver;

  constructor(uri: string, user: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async runInTransaction(queries: string[]): Promise<void> {
    const session: Session = this.driver.session();
    const tx: Transaction = session.beginTransaction();

    try {
      for (const query of queries) {
        await tx.run(query);
      }
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await session.close();
    }
  }
}
