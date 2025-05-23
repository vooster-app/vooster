# @vooster/ui

A modern, accessible UI component library built with React, TypeScript, and Tailwind CSS. This package provides a collection of reusable components following best practices for performance, accessibility, and developer experience.

## Features

- 🎨 Built with Tailwind CSS and Shadcn UI
- ♿️ Accessible components using Radix UI primitives
- 📦 Tree-shakeable exports
- 🎯 TypeScript support
- 🚀 Server Components ready
- 📱 Mobile-first responsive design

## Installation

```bash
npm install @vooster/ui
```

## Usage

Import components directly from their respective paths:

```tsx
import { Button } from '@vooster/ui/button'
import { Card } from '@vooster/ui/card'
```

For styling, import the global CSS:

```tsx
import '@vooster/ui/globals.css'
```

## Adding New Components

To add a new component to the package:

1. Create your component in `src/components/your-component.tsx`
2. Add the export to `package.json` in the `exports` field:

```json
{
  "exports": {
    "./your-component": "./src/components/your-component.tsx"
  }
}
```

3. If your component requires new dependencies, add them to the `dependencies` or `devDependencies` section of `package.json`

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Best Practices

- Use TypeScript for all components
- Implement proper error handling and validation
- Follow the mobile-first approach with Tailwind CSS
- Keep components as Server Components when possible
- Use proper error boundaries for client components
- Implement proper loading states and suspense boundaries
