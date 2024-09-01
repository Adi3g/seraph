// src/utils/logger.ts

import { createLogger, transports, format } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "seraph.log" }),
  ],
});

export default logger;

// Use logger in QueryBuilder or Repository methods
