# Seraph

**Seraph** is an open-source, TypeScript-based query builder for Neo4j that simplifies the construction of Cypher queries through a fluent API. Offers a type-safe and intuitive way to build queries, making it easier for developers to work with Neo4j.

## Features

- **Fluent API:** Easily build complex Neo4j queries using a chainable, fluent interface.
- **Type Safety:** Leverages TypeScript for robust type-checking, reducing errors and improving developer productivity.
- **Extensible:** Designed to be extended with custom functions, relationships, and more advanced Cypher query patterns.

## Getting Started

### Prerequisites

- Node.js (version 14 or above)
- Neo4j database (version 4.x or above)
- npm or yarn for package management

### Installation

To install Seraph, you can use npm:

```bash
npm install seraph4j
```

Or with yarn:

```bash
yarn add seraph4j
```

## Usage

Here is a basic example of how to use Seraph to create a simple query:

### Creating Nodes

```typescript
import { QueryBuilder, Node } from 'seraph';

const personNode = new Node('Person', { name: 'Alice', age: 30 });
const query = new QueryBuilder()
  .createNode(personNode)
  .build();

console.log(query); 
// Outputs: CREATE (n:Person {name: Alice, age: 30})
```

### Creating Relationships

```typescript
import { QueryBuilder, Relationship } from 'seraph';

const relationship = new Relationship('FRIEND', 'n', 'm');
const query = new QueryBuilder()
  .createRelationship(relationship)
  .build();

console.log(query); 
// Outputs: CREATE (n)-[:FRIEND]->(m)
```

## Project Structure

The project follows Domain-Driven Design principles, structured as follows:

- **`src/core/`:** Core application logic (query builders).
- **`src/domain/`:** Domain models like Nodes and Relationships.
- **`src/infrastructure/`:** Infrastructure-specific code, such as database interactions.
- **`src/types/`:** TypeScript types and interfaces.
- **`src/utils/`:** Utility functions.
- **`tests/`:** Unit and integration tests.

## Running Tests

Seraph uses Jest for testing. To run tests, use the following command:

```bash
npm test
```

This will execute all unit and integration tests, ensuring the integrity of the core functionality.

## Contributing

Contributions are welcome! Here’s how you can contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

### Code of Conduct

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) to understand the expectations for participants' behavior in the community.

### Contribution Guidelines

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests and the coding style we use.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
