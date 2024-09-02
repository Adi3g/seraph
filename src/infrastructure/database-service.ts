/* eslint-disable @typescript-eslint/no-explicit-any */
import neo4j, { Driver, Session, Transaction } from "neo4j-driver";
import { ConfigService, SeraphConfig } from "../config/config";
import logger from "../services/logger";

/**
 * DatabaseService handles interactions with the Neo4j database, including query execution,
 * caching, and batch processing.
 */
export class DatabaseService {
  private driver: Driver;
  private cache: Map<string, { data: any; timestamp: number }>;
  private config: SeraphConfig;

  /**
   * Initializes a new instance of the DatabaseService class.
   * @param uri - The URI of the Neo4j database.
   * @param user - The username for the Neo4j database.
   * @param password - The password for the Neo4j database.
   * @param configService - An instance of ConfigService to provide configuration settings.
   */
  constructor(
    uri: string,
    user: string,
    password: string,
    configService: ConfigService = new ConfigService(),
  ) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    this.cache = new Map();
    this.config = configService.getConfig();
  }

  /**
   * Executes a Cypher query with optional parameters, utilizing cache if enabled.
   * @param query - The Cypher query string.
   * @param parameters - Optional parameters for the query.
   * @returns A promise that resolves to the query result.
   * @throws Will throw an error if the query execution fails.
   */
  async executeQuery(
    query: string,
    parameters: Record<string, any> = {},
  ): Promise<any> {
    const cacheKey = this.generateCacheKey(query, parameters);
    const currentTime = Date.now();

    // Check cache if enabled
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cachedEntry = this.cache.get(cacheKey)!;
      if (currentTime - cachedEntry.timestamp < this.config.cacheTTL) {
        logger.info(`Cache hit for query: ${query}`);
        return cachedEntry.data;
      } else {
        this.cache.delete(cacheKey); // Expire cache entry
      }
    }

    const session: Session = this.driver.session();
    try {
      logger.info(
        `Executing query: ${query} with parameters: ${JSON.stringify(parameters)}`,
      );
      const result = await session.run(query, parameters);
      const records = result.records.map((record) => record.toObject());

      // Cache the result if caching is enabled
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, { data: records, timestamp: currentTime });
        logger.info("Query executed and cached successfully.");
      }

      return records;
    } catch (error: any) {
      logger.error(`Failed to execute query: ${error.message}`);
      throw new Error(`Failed to execute query: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Executes a batch of queries in transactions, processing them in batches to optimize performance.
   * @param queries - An array of objects containing the query string and parameters for each query.
   * @returns A promise that resolves when all batches have been processed.
   * @throws Will throw an error if a batch fails to commit.
   */
  async executeBatch(
    queries: { query: string; parameters: Record<string, any> }[],
  ): Promise<void> {
    const session: Session = this.driver.session();

    try {
      // Process queries in batches
      for (let i = 0; i < queries.length; i += this.config.batchSize) {
        const batch = queries.slice(i, i + this.config.batchSize);
        const tx: Transaction = session.beginTransaction();

        try {
          for (const { query, parameters } of batch) {
            logger.info(
              `Running batch query: ${query} with parameters: ${JSON.stringify(parameters)}`,
            );
            await tx.run(query, parameters);
          }
          await tx.commit();
          logger.info(
            `Batch ${Math.ceil(i / this.config.batchSize) + 1} committed successfully.`,
          );
        } catch (error: any) {
          await tx.rollback();
          logger.error(
            `Batch ${Math.ceil(i / this.config.batchSize) + 1} failed and rolled back: ${error.message}`,
          );
          throw new Error(`Batch processing failed: ${error.message}`);
        }
      }
    } finally {
      await session.close();
    }
  }

  /**
   * Generates a unique cache key based on the query and its parameters.
   * @param query - The Cypher query string.
   * @param parameters - The parameters for the query.
   * @returns A string representing the unique cache key.
   */
  private generateCacheKey(
    query: string,
    parameters: Record<string, any>,
  ): string {
    return JSON.stringify({ query, parameters });
  }

  /**
   * Clears all entries in the query cache.
   */
  clearCache(): void {
    this.cache.clear();
    logger.info("Cache cleared.");
  }

  /**
   * Closes the Neo4j driver connection, cleaning up resources.
   * @returns A promise that resolves when the connection is closed.
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}
