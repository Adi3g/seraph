/**
 * Interface defining the configuration options for Seraph.
 */
export interface SeraphConfig {
  /** Enables or disables query caching. */
  cacheEnabled: boolean;

  /** The time-to-live for cache entries, in milliseconds. */
  cacheTTL: number;

  /** The number of queries to process per batch operation. */
  batchSize: number;
}

/**
 * Default configuration settings for Seraph.
 */
export const defaultConfig: SeraphConfig = {
  cacheEnabled: true,
  cacheTTL: 300000, // Default cache TTL: 5 minutes
  batchSize: 100, // Default batch size: 100 queries
};

/**
 * ConfigService provides configuration settings for Seraph, merging default and custom configurations.
 */
export class ConfigService {
  private config: SeraphConfig;

  /**
   * Initializes a new instance of the ConfigService class.
   * @param customConfig - Custom configuration settings to override defaults.
   */
  constructor(customConfig: Partial<SeraphConfig> = {}) {
    this.config = { ...defaultConfig, ...customConfig };
  }

  /**
   * Retrieves the current configuration settings.
   * @returns The merged configuration settings.
   */
  getConfig(): SeraphConfig {
    return this.config;
  }
}
