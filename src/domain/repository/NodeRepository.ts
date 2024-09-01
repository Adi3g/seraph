// src/domain/repository/NodeRepository.ts

import { Node } from '../Node';

export interface NodeRepository {
  create(node: Node): Promise<void>;
  findById(id: string): Promise<Node | null>;
  // Additional repository methods as needed
}
