# Technology Stack

## Core Framework

- **Astro 5.12**: Static site generator with SSR capabilities
- **TypeScript**: Primary language for type safety
- **Node.js**: Runtime environment

## Frontend Stack

- **React 18**: Component library for interactive UI
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Framer Motion**: Animation library
- **Magic UI**: Additional UI components

## AI Integration

- **Anthropic Claude API**: Primary AI service for story generation
- **Claude Sonnet 4**: Specific model for optimal quality/cost ratio

## Deployment & Hosting

- **Vercel**: Serverless deployment platform
- **GitHub Actions**: CI/CD automation
- **Git**: Version control and content storage

## Content Management

- **Astro Content Collections**: Type-safe content management
- **MDX**: Markdown with JSX for rich content
- **Zod**: Schema validation for content types

## Development Tools

- **PNPM**: Package manager
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Common Commands

```bash
# Development
pnpm dev                 # Start dev server at localhost:4321
pnpm build              # Build production site to ./dist/
pnpm preview            # Preview production build locally

# AI Testing
pnpm test:claude        # Test Claude API and generate sample story
pnpm setup:check        # Check project setup and API connectivity

# Package Management
pnpm install            # Install dependencies
pnpm add <package>      # Add new dependency
```

## Environment Variables

- `ANTHROPIC_API_KEY`: Required for AI story generation
- Set in `.env.local` for development
- Configure in Vercel/GitHub Secrets for production

## Build Configuration

- SSR mode enabled for dynamic content generation
- Vercel adapter with web analytics and image optimization
- Custom alias `@` pointing to `./src`
- External dependencies: framer-motion, magic-ui
