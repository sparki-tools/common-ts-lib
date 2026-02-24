# @sparki/common-ts-lib

Shared TypeScript utilities for Sparki applications.

## Overview

This library provides common utilities, types, and React hooks for Sparki applications:

- **utils** - Utility functions (cn, formatting, validation)
- **types** - Shared TypeScript type definitions (ApiResponse, PaginationMeta, etc.)
- **websocket** - WebSocket client for real-time communication
- **react** - React hooks (useForm, useWebSocket, useClickOutside, etc.)

## Installation

```bash
npm install @sparki/common-ts-lib
```

## Usage

### Utils

```typescript
import { cn, formatBytes, formatDate, formatRelativeTime, isValidEmail } from '@sparki/common-ts-lib/utils';

// Class name merging (Tailwind)
const className = cn('base-class', condition && 'conditional-class');

// Formatting
formatBytes(1024);           // "1 KB"
formatDate(new Date());      // "01/15/2024, 10:30 AM"
formatRelativeTime(date);    // "2 hours ago"

// Validation
isValidEmail('test@example.com');  // true
```

### Types

```typescript
import type { ApiResponse, ApiError, PaginationMeta, PaginatedResponse } from '@sparki/common-ts-lib/types';

interface MyData {
  id: string;
  name: string;
}

const response: ApiResponse<MyData> = {
  success: true,
  data: { id: '1', name: 'Test' },
  timestamp: new Date().toISOString(),
};
```

### WebSocket

```typescript
import { WebSocketClient, createWebSocketClient } from '@sparki/common-ts-lib/websocket';

const client = createWebSocketClient('wss://api.example.com/ws');

await client.connect();

// Subscribe to a channel
const unsubscribe = client.subscribe('notifications', (data) => {
  console.log('Received:', data);
});

// Send a message
client.send('chat', { message: 'Hello!' });

// Cleanup
client.disconnect();
```

### React Hooks

```typescript
import { 
  useForm, 
  useWebSocket, 
  useClickOutside, 
  useDebounce, 
  useLocalStorage,
  useMediaQuery 
} from '@sparki/common-ts-lib/react/hooks';

// Form management with validation
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { email: '', password: '' },
  schema: loginSchema,
  onSubmit: async (data) => {
    await login(data);
  },
});

// WebSocket connection
const { isConnected, lastMessage, send } = useWebSocket('wss://api.example.com/ws');

// Click outside detection
const ref = useClickOutside(() => setIsOpen(false));

// Debounced function
const debouncedSearch = useDebounce(searchFn, 300);

// Local storage state
const [theme, setTheme] = useLocalStorage('theme', 'light');

// Media query
const isMobile = useMediaQuery('(max-width: 768px)');
```

## Directory Structure

```
common-ts-lib/
├── src/
│   ├── utils/          # Utility functions
│   │   ├── cn.ts       # Class name merging
│   │   ├── format.ts   # Formatting utilities
│   │   └── validation.ts
│   ├── types/          # Type definitions
│   │   └── common.ts   # ApiResponse, PaginationMeta, etc.
│   ├── websocket/      # WebSocket client
│   │   └── client.ts
│   └── react/          # React utilities
│       └── hooks/      # Custom React hooks
│           ├── useUI.ts
│           ├── useForm.ts
│           └── useWebSocket.ts
├── dist/               # Compiled output
├── package.json
└── README.md
```

## Exports

The library provides multiple entry points for tree-shaking:

```typescript
// Everything
import { cn, useForm, ApiResponse } from '@sparki/common-ts-lib';

// Just utils
import { cn, formatBytes } from '@sparki/common-ts-lib/utils';

// Just types
import type { ApiResponse, PaginationMeta } from '@sparki/common-ts-lib/types';

// Just websocket
import { WebSocketClient } from '@sparki/common-ts-lib/websocket';

// Just React hooks
import { useForm, useWebSocket } from '@sparki/common-ts-lib/react/hooks';
```

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Build the library
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## Related Repositories

- [web-app](https://github.com/sparki-tools/web-app) - Main web application
- [api-contracts](https://github.com/sparki-tools/api-contracts) - API type definitions
- [common-go-lib](https://github.com/sparki-tools/common-go-lib) - Go shared libraries

## License

MIT
