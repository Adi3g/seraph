/* eslint-disable @typescript-eslint/no-explicit-any */
import neo4j, { Driver, Session } from "neo4j-driver";
import logger from "../services/logger";
export class DatabaseService {
  private driver: Driver;
  private cache: Map<string, any>;
  private batchSize: number;

  /**
   * Initializes a new instance of the DatabaseService class.
   * @param uri The URI of the Neo4j database.
   * @param user The username for the Neo4j database.
   * @param password The password for the Neo4j database.
   */
  constructor(uri: string, user: string, password: string, batchSize = 100) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    this.cache = new Map(); // Initialize an in-memory cache
    this.batchSize = batchSize; // Set default batch size
  }

  /**
   * Executes a Cypher query with optional parameters, using cache if available.
   * @param query The Cypher query string.
   * @param parameters The parameters for the query.
   * @returns A promise resolving with the query result.
   */
  async executeQuery(
    query: string,
    parameters: Record<string, any> = {},
  ): Promise<any> {
    const cacheKey = this.generateCacheKey(query, parameters);
    if (this.cache.has(cacheKey)) {
      logger.info(`Cache hit for query: ${query}`);
      return this.cache.get(cacheKey);
    }

    const session: Session = this.driver.session();
    try {
      logger.info(
        `Executing query: ${query} with parameters: ${JSON.stringify(parameters)}`,
      );
      const result = await session.run(query, parameters);
      const records = result.records.map((record) => record.toObject());
      this.cache.set(cacheKey, records); // Cache the result
      logger.info("Query executed and cached successfully.");
      return records;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`Failed to execute query: ${error.message}`);
      throw new Error(`Failed to execute query: ${error.message}`);
    } finally {
      await session.close();
    }
  }
  /**
   * Executes queries in batches to optimize performance for large-scale operations.
   * @param queries Array of query objects containing the query and parameters.
   */
  async executeBatch(
    queries: { query: string; parameters: Record<string, any> }[],
  ): Promise<void> {
    const session: Session = this.driver.session();

    try {
      for (let i = 0; i < queries.length; i += this.batchSize) {
        const batch = queries.slice(i, i + this.batchSize);
        const tx = session.beginTransaction();

        try {
          for (const { query, parameters } of batch) {
            await tx.run(query, parameters);
          }
          await tx.commit();
          logger.info(
            `Batch ${i / this.batchSize + 1} committed successfully.`,
          );
        } catch (error: any) {
          await tx.rollback();
          logger.error(
            `Batch ${i / this.batchSize + 1} failed and rolled back: ${error.message}`,
          );
          throw new Error(`Batch processing failed: ${error.message}`);
        }
      }
    } finally {
      await session.close();
    }
  }

  /**
   * Generates a cache key based on the query and parameters.
   * @param query The Cypher query string.
   * @param parameters The parameters for the query.
   * @returns A unique cache key string.
   */
  private generateCacheKey(
    query: string,
    parameters: Record<string, unknown>,
  ): string {
    return JSON.stringify({ query, parameters });
  }

  /**
   * Clears the query cache.
   */
  clearCache(): void {
    this.cache.clear();
    logger.info("Cache cleared.");
  }

  /**
   * Closes the Neo4j driver connection.
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}
