# Common TypeScript Library

Shared TypeScript utilities for Sparki frontend applications.

## Overview

This library provides common utilities for Sparki frontend apps:

- **api** - API client with request/response handling
- **hooks** - Custom React hooks (useWebSocket, useAuth, etc.)
- **types** - Shared TypeScript type definitions
- **utils** - Utility functions (formatting, validation, etc.)

## Installation

```bash
npm install @sparki-tools/common
```

## Usage

```typescript
import { api, useWebSocket, formatDate } from '@sparki-tools/common';

// API client
const projects = await api.projects.list();

// WebSocket hook
const { subscribe, send } = useWebSocket();

// Utilities
const formatted = formatDate(new Date());
```

## Directory Structure

```
common-ts-lib/
├── src/
│   ├── api/            # API client
│   ├── hooks/          # React hooks
│   ├── types/          # Type definitions
│   └── utils/          # Utility functions
├── tests/
├── package.json
└── README.md
```

## Publishing

```bash
npm version patch
npm publish
```

## Related Repositories

- [web](https://github.com/sparki-tools/web)
- [api-contracts](https://github.com/sparki-tools/api-contracts)

## License

MIT
