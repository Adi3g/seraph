import neo4j, { Driver, Session } from "neo4j-driver";
import logger from "../services/logger";

export class DatabaseService {
  private driver: Driver;

  /**
   * Initializes a new instance of the DatabaseService class.
   * @param uri The URI of the Neo4j database.
   * @param user The username for the Neo4j database.
   * @param password The password for the Neo4j database.
   */
  constructor(uri: string, user: string, password: string) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  /**
   * Executes a Cypher query with optional parameters.
   * @param query The Cypher query string.
   * @param parameters The parameters for the query.
   * @returns A promise resolving with the query result.
   */
  async executeQuery(
    query: string,
    parameters: Record<string, unknown> = {},
  ): Promise<unknown> {
    const session: Session = this.driver.session();
    try {
      logger.info(
        `Executing query: ${query} with parameters: ${JSON.stringify(parameters)}`,
      );
      const result = await session.run(query, parameters);
      logger.info("Query executed successfully.");
      return result.records;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`Failed to execute query: ${error.message}`);
      throw new Error(`Failed to execute query: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Closes the Neo4j driver connection.
   */
  async close(): Promise<void> {
    await this.driver.close();
  }
}
