# @vooster/supabase

A TypeScript package that provides type-safe database access, authentication, and utility functions for Supabase in the Vooster application.

## Directory Structure

```
supabase/
├── src/
│   ├── queries/           # Reusable database queries
│   │   ├── auth/         # Authentication related queries
│   │   ├── users/        # User management queries
│   │   └── common/       # Shared query utilities
│   ├── migrations/       # Database migrations
│   ├── auth/             # Authentication utilities
│   │   ├── providers/    # OAuth provider configurations
│   │   └── policies/     # RLS policies
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Shared utilities
└── package.json
```

## Features

- 🔒 Type-safe database queries
- 🔐 Authentication utilities
- 📦 Reusable query functions
- 🎯 Generated TypeScript types
- 🛡️ Row Level Security (RLS) policies

## Usage

```typescript
import { createClient } from '@vooster/supabase'
import { getUserProfile } from '@vooster/supabase/queries/users'

// Initialize Supabase client
const supabase = createClient()

// Use type-safe queries
const profile = await getUserProfile(userId)
```

## Query Organization

Queries are organized by domain in the `src/queries` directory:

```typescript
// src/queries/users/get-profile.ts
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}
```

## Authentication

Authentication utilities and configurations are in the `src/auth` directory:

```typescript
// src/auth/providers/google.ts
export const googleProvider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  // ... configuration
}
```

## Type Safety

Types are generated from your database schema and available in the `src/types` directory:

```typescript
// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          // ... other fields
        }
        // ... other type definitions
      }
    }
  }
}
```

## Best Practices

1. **Queries**
   - Use TypeScript for type safety
   - Implement proper error handling
   - Follow the single responsibility principle
   - Keep queries focused and reusable

2. **Authentication**
   - Use type-safe auth utilities
   - Implement proper error handling
   - Follow security best practices

3. **Migrations**
   - Keep migrations atomic
   - Include both up and down migrations
   - Test migrations locally

## Development

```bash
# Install dependencies
npm install

# Generate types
npm run generate

# Run tests
npm test

# Build package
npm run build
```

## Contributing

1. Create a new branch for your feature
2. Add tests for new functionality
3. Update types if necessary
4. Submit a pull request

## License

Private - All rights reserved
