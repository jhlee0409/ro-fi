# Project Structure

## Root Directory

```
├── .astro/              # Astro build artifacts and type definitions
├── .kiro/               # Kiro IDE configuration and steering rules
├── scripts/             # Utility scripts for testing and validation
├── src/                 # Main source code
├── public/              # Static assets
└── dist/                # Production build output
```

## Source Code Organization (`src/`)

### Pages (`src/pages/`)

- **File-based routing**: Each file becomes a route
- **Dynamic routes**: Use `[param]` syntax for dynamic segments
- **API routes**: `src/pages/api/` for serverless functions
- **Layout**: Astro components with `.astro` extension

Key routes:

- `index.astro` - Homepage
- `novels.astro` - Novel listing page
- `novels/[slug].astro` - Individual novel page
- `novels/[slug]/chapter/[chapterNumber].astro` - Chapter reader
- `admin.astro` - Admin interface
- `api/generate-story.ts` - Story generation API

### Content (`src/content/`)

- **Type-safe collections** defined in `config.ts`
- **Three main collections**:
  - `novels/` - Novel metadata and summaries
  - `chapters/` - Individual chapter content (MDX format)
  - `tropes/` - Romance fantasy trope definitions

### Components (`src/components/`)

- **React components** for interactive UI
- **UI components** in `ui/` subdirectory (Shadcn/ui based)
- **Reusable components** for novel display, admin tools

### Libraries (`src/lib/`)

- **AI integration**: `ai-story-generator.ts` - Claude API wrapper
- **Context management**: `story-context-manager.ts` - Story continuity
- **Utilities**: `utils.ts` - Common helper functions

### Styles (`src/styles/`)

- **Global styles**: `globals.css` with Tailwind imports
- **CSS custom properties** for theming
- **Component-specific styles** co-located with components

## Content Collection Schemas

### Novels Collection

```typescript
{
  title: string,
  author: string (default: 'Claude AI'),
  summary: string,
  status: 'serializing' | 'completed' | 'hiatus',
  tropes: string[],
  publishedDate: Date,
  totalChapters: number
}
```

### Chapters Collection

```typescript
{
  title: string,
  novel: string, // Parent novel slug
  chapterNumber: number,
  publicationDate: Date,
  wordCount?: number,
  summary?: string
}
```

### Tropes Collection

```typescript
{
  name: string,
  description: string,
  slug?: string
}
```

## File Naming Conventions

- **Astro pages**: `kebab-case.astro`
- **React components**: `PascalCase.tsx`
- **TypeScript files**: `kebab-case.ts`
- **Content files**: `kebab-case.md` or `kebab-case.mdx`
- **Utility scripts**: `kebab-case.js`

## Import Aliases

- `@/` - Points to `src/` directory
- Use for cleaner imports: `import { utils } from '@/lib/utils'`

## Content File Structure

### Novel Files (`src/content/novels/`)

- Markdown files with frontmatter metadata
- Slug derived from filename
- Summary and metadata in frontmatter

### Chapter Files (`src/content/chapters/`)

- MDX files for rich content support
- Naming: `{novel-slug}-{chapter-number}.mdx`
- Chapter content in markdown body

### Trope Files (`src/content/tropes/`)

- Markdown files defining romance fantasy tropes
- Used by AI generation system for context
