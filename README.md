# Dependency Injection Container for JavaScript

### Installation

```bash
pnpm add @escral/di
```

## Container

The `Container` class provides type-safe dependency injection container functionality.

### Basic Usage

```typescript
import { Container } from '@escral/di'

interface ServiceContainer {
  logger: LoggerService
  userService: UserService
}

const container = new Container<ServiceContainer>();

container
    .register('logger', () => new LoggerService())
    .register('userService', (c) => new UserService(c.get('logger')))
```

### Extend container types from different places
```typescript
// service/di.ts

export interface ServiceContainer {}

export const container = new Container<ServiceContainer>();
```

```typescript
// module/logger/boot.ts
import { container } from '#/service/di'

declare module '#/service/di' {
    interface ServiceContainer {
        logger: LoggerService
    }
}

container.register('logger', () => new LoggerService());
```

### Parent container

```typescript
import { Container } from '@escral/di'

interface AppContainer {
    db: DatabaseService
}

interface RequestContainer extends AppContainer {
    auth: AuthService
}

const appContainer = new Container<AppContainer>()
const requestContainer = new Container<RequestContainer>(appContainer)

// Now can access parent container dependencies
const db = requestContainer.get('db')
```


## Utils

### getBindingsProxy

Creates a proxy object to access container bindings directly, without calling `get` method. Allows destructuring.

```typescript
import { Container, getBindingsProxy } from '@escral/di'

//

const container = new Container<{
    logger: LoggerService
}>()

const bindings = getBindingsProxy(container)

// Destructuring
const { logger } = bindings

// Accessing directly
const logger2 = bindings.logger

// Iterating over bindings
for (const key in bindings) {
    // 1. key === 'logger'
}
```

### registerDIRelation

Registers dependency relations for a constructor or class. This allows you to specify which dependencies a class needs by their container keys.

```typescript
import { registerDIRelation } from '@escral/di'

class UserService {
    constructor(
        public logger: LoggerService,
        public db: DatabaseService,
    ) {}
}

// Register that UserService needs 'logger' and 'db' from the container
registerDIRelation(UserService, ['logger', 'db'])
```

### constructWithDependencies

Constructs a class instance with dependencies automatically resolved from the container. Requires that dependency relations have been registered using `registerDIRelation`.

```typescript
import { Container, registerDIRelation, constructWithDependencies } from '@escral/di'

class UserService {
    constructor(
        public logger: LoggerService,
        public db: DatabaseService,
    ) {}
}

const container = new Container<{
    logger: LoggerService
    db: DatabaseService
}>()

container.register('logger', () => new LoggerService())
container.register('db', () => new DatabaseService())

// Register dependency relations
registerDIRelation(UserService, ['logger', 'db'])

// Construct instance with dependencies automatically injected
const userService = constructWithDependencies(UserService, container)
// userService.logger and userService.db are now available
```

### resolveDependencies

Lower-level utility that resolves dependencies from a container based on registered relations. Returns an array of resolved dependencies or `undefined` if no relations are registered.

```typescript
import { Container, registerDIRelation, resolveDependencies } from '@escral/di'

class UserService {
    constructor(
        public logger: LoggerService,
        public db: DatabaseService,
    ) {}
}

const container = new Container<{
    logger: LoggerService
    db: DatabaseService
}>()

container.register('logger', () => new LoggerService())
container.register('db', () => new DatabaseService())

registerDIRelation(UserService, ['logger', 'db'])

// Resolve dependencies
const deps = resolveDependencies(UserService, container)
// deps === [LoggerService instance, DatabaseService instance]

// With safe resolve option (won't throw on missing dependencies)
const safeDeps = resolveDependencies(UserService, container, { safeResolve: true })
```

