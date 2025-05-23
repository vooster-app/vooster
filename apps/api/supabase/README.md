# Supabase API

This directory contains the Supabase configuration, database migrations, and Edge Functions for the Vooster application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Node.js 18+ and npm/yarn

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Login to Supabase:
```bash
npm run login
```

3. Start Supabase locally:
```bash
npm run dev
```

This will start all Supabase services locally using Docker. The services include:
- PostgreSQL database
- PostgREST API
- GoTrue authentication
- Realtime subscriptions
- Storage API
- Edge Functions

## Available Scripts

- `npm run dev` - Start Supabase services locally
- `npm run login` - Login to Supabase CLI
- `npm run migration:new` - Create a new migration file
- `npm run migration:up` - Apply pending migrations
- `npm run seed` - Generate and run database seeds
- `npm run reset` - Reset the local database
- `npm run generate` - Generate TypeScript types from database schema
- `npm run push:production` - Push schema changes to production database
- `npm run push:local` - Push schema changes to local database

## Database Migrations

Migrations are stored in the `supabase/migrations` directory. Each migration file follows the naming convention: `YYYYMMDDHHMMSS_description.sql`.

To create a new migration:
```bash
npm run migration:new your_migration_name
```

To apply migrations:
```bash
npm run migration:up
```

## Edge Functions

Edge Functions are serverless functions that run on Supabase's infrastructure. They are located in the `supabase/functions` directory.

To deploy a function:
```bash
supabase functions deploy function-name
```

## Configuration

The `config.toml` file contains the local development configuration for Supabase services. Key settings include:

```toml
[api]
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
port = 54323

[inbucket]
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
file_size_limit = "50MiB"

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true
```

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Database Migrations Guide](https://supabase.com/docs/guides/deployment/database-migrations)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

## Troubleshooting

If you encounter issues with local development:

1. Ensure Docker is running
2. Try resetting the database: `npm run reset`
3. Check Docker logs: `docker logs supabase-db`
4. Verify ports are not in use (54321-54326)
