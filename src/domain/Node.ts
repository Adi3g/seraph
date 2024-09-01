/**
 * Represents a node in the Neo4j graph database.
 */
export class Node {
    public label: string;
    public properties: Record<string, any>;
  
    /**
     * Initializes a new instance of the Node class.
     * @param label The label of the node.
     * @param properties The properties of the node.
     */
    constructor(label: string, properties: Record<string, any>) {
      this.label = label;
      this.properties = properties;
    }
  }
  