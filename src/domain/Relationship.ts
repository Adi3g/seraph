/**
 * Represents a relationship between two nodes in the Neo4j graph database.
 */
export class Relationship {
    public type: string;
    public from: string;
    public to: string;
  
    /**
     * Initializes a new instance of the Relationship class.
     * @param type The type of the relationship.
     * @param from The start node identifier.
     * @param to The end node identifier.
     */
    constructor(type: string, from: string, to: string) {
      this.type = type;
      this.from = from;
      this.to = to;
    }
  }
  