# Utilities & Helpers (`utils/`)

This directory contains shared helper functions, configuration loaders, and project utilities.

## Files

- **`env.ts`**: Loads environment variables from `.env` file at root and exports strongly-typed configuration settings.

## Usage Example

```typescript
import { envConfig } from '../utils/env';

console.log(envConfig.baseUrl);
console.log(envConfig.isHeadless);
```
