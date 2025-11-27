# Dependency Injection Container for JavaScript

### Installation

```bash
pnpm add @escral/di
```

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

interface RequestContainer {
    auth: AuthService
}

const appContainer = new Container<AppContainer>()
// Pass parent container interface as second generic parameter
const requestContainer = new Container<RequestContainer, AppContainer>(appContainer)

// Now can access parent container services
const db = requestContainer.get('db')
```
