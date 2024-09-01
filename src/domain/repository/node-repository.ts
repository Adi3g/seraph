import { Node } from "../node";

export interface NodeRepository {
  create(node: Node): Promise<void>;
  findById(id: string): Promise<Node | null>;
  // Additional repository methods as needed
}
