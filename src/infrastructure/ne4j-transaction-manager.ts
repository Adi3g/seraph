// src/infrastructure/Neo4jTransactionManager.ts

import neo4j, { Driver, Session, Transaction } from "neo4j-driver";
import logger from "../services/logger";

export class Neo4jTransactionManager {
  private driver: Driver;
  private batchSize: number;

  constructor(uri: string, user: string, password: string, batchSize = 100) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    this.batchSize = batchSize; // Set default batch size
  }

  async runBatchedQueries(
    queries: { query: string; parameters: Record<string, unknown> }[],
  ): Promise<void> {
    const session: Session = this.driver.session();

    try {
      for (let i = 0; i < queries.length; i += this.batchSize) {
        const batch = queries.slice(i, i + this.batchSize);
        const tx: Transaction = session.beginTransaction();
        try {
          for (const { query, parameters } of batch) {
            logger.info(
              `Running batched query: ${query} with parameters: ${JSON.stringify(parameters)}`,
            );
            await tx.run(query, parameters);
          }
          await tx.commit();
          logger.info("Batch committed successfully.");
        } catch (error) {
          await tx.rollback();
          logger.error(`Batch failed and rolled back: ${error}`);
          throw new Error(`Batch failed: ${error}`);
        }
      }
    } finally {
      await session.close();
    }
  }
}
