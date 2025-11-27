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
    .register('userService', (c) => new UserService(c.logger))
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

