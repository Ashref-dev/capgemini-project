# AGENTS.md

Project instructions for AI assistants and contributors working on IntelliConnect.

## Mission

IntelliConnect is a Capgemini Tunisia partnership management platform for a software engineering master's internship project with an AI focus. The product must feel reliable, polished, and complete: excellent UI/UX, strong performance, careful edge-case handling, and a working product after every change.

## Language Rules

- Code, comments, commit messages, file names, and documentation are written in English.
- User-facing web application copy is written in French.
- API error payload keys stay in English, but messages shown to users must be French.
- Do not mix French implementation names into TypeScript identifiers unless the existing domain model already requires it.

## Operating Standard

- Explore before changing. Read the relevant files, existing patterns, and data flow.
- Make the smallest correct change that solves the requested problem.
- Keep the repo stable after every turn: no knowingly broken builds, broken routes, or half-finished UI.
- Prefer existing abstractions and components over new ones.
- Do not invent product behavior when the code or README can answer it.
- When uncertain and the answer cannot be discovered locally, ask a concise question.

## Package Manager

Bun is mandatory.

```bash
bun install
bun dev
bun run build
bun run lint
bun add package-name
bun add -D package-name
```

Never use `npm`, `yarn`, `pnpm`, or `npx`.

## Project Architecture

Current structure:

```text
app/                         Next.js App Router pages, layouts, and API routes
components/ui/                 Shared shadcn/ui primitives and design-system wrappers
components/agent/              AI chat UI and tool visualizations
components/dashboard/
components/partner/
components/projects/
hooks/                         Client hooks
lib/                           Shared utilities
lib/server/auth/               JWT and session helpers
lib/server/db/                 Drizzle config, schemas, migrations, DW config
lib/server/services/           Shared server business logic
lib/server/agent/              AI agent tools, RAG, prompts, evals, tests
lib/server/ai/                 AI-assisted business services
scripts/                     DB, seed, migration, and maintenance scripts
```

Layer rules:

- `app/` orchestrates routing, rendering, and route handlers. Keep complex business logic out of pages.
- API routes authenticate first when protected, validate external input, and return structured errors.
- Shared server logic belongs in `lib/server/services`, `lib/server/agent`, or another domain-specific module under `lib/server`.
- Drizzle schema and database config stay in `lib/server/db`.
- Reusable UI primitives belong in `components/ui`.
- Domain UI belongs under the matching `components/*` folder.
- Do not add a new top-level architecture pattern unless the repo is intentionally migrated.

## TypeScript Quality Gate

- Strict TypeScript is required.
- Do not use `any`, `as any`, `@ts-ignore`, or `@ts-expect-error`.
- Prefer `unknown` plus narrowing when a value is genuinely unknown.
- Do not use the `Function` type. Write specific function signatures.
- Type every component prop and every non-obvious function parameter.
- Use discriminated unions for multi-state UI and workflows.
- Use `satisfies` for type-safe object literals when helpful.
- Validate request bodies, query params, route params, and AI tool inputs with Zod or explicit guards.

## UI/UX Quality Gate

Every UI change must account for:

- Loading state.
- Error state.
- Empty state.
- Success state.
- Long text and maximum data.
- Mobile, tablet, and desktop layouts.
- Light and dark mode.
- Keyboard navigation and accessible labels.
- Slow network and failed API responses.
- Hover, focus, active, and disabled states for interactive elements.

Do not show raw database IDs, enum values, or raw timestamps to users. Humanize them in French.

Do not truncate text without a tooltip or accessible way to reveal the full value.

Use consistent spacing on a 4px grid through Tailwind utilities.

## Design System

- Use Tailwind CSS and theme variables. Avoid custom CSS unless Tailwind cannot express the need cleanly.
- Use shadcn/ui and existing `components/ui` primitives before creating new primitives.
- Use Hugeicons for product icons unless an existing component already uses another icon set.
- Use Framer Motion for app animations and state transitions.
- Keep animations subtle, purposeful, and performant.
- Avoid generic template layouts. Favor clear hierarchy, disciplined whitespace, and high-density operational screens where appropriate.
- Cards are for repeated items, dialogs, and framed tools. Do not nest cards inside cards.
- Do not use inline styles except for truly dynamic values.
- Do not use `<img>` for optimized app imagery; use Next.js `<Image>` where applicable.
- Do not use `<a>` for internal navigation; use Next.js `<Link>`.

### Color and Surface Tokens

- All product UI must use the shared theme tokens: `primary`, `primary-foreground`, `secondary`, `accent`, `muted`, `background`, `foreground`, `card`, `border`, `input`, and `ring`.
- Brand anchors are `primary: #0070AD` in light mode and `primary: #00A3E0` in dark mode. Secondary and accent surfaces are restrained tints derived from those colors.
- Do not hardcode Tailwind palette colors such as `blue-600`, `blue-700`, or raw brand hex values in app UI. Put brand values in CSS variables once, then consume tokens.
- Primary actions use `bg-primary text-primary-foreground hover:bg-primary/90`.
- Secondary actions use `bg-secondary text-secondary-foreground hover:bg-secondary/80`.
- Focus states use `ring-ring` or `focus-visible:ring-ring/50`.
- Dark mode must be first-class: every surface needs adequate contrast without separate one-off hex overrides.
- Gradients are allowed only when they clarify hierarchy or brand context. Avoid decorative gradients on dense product screens.
- Prefer quiet surfaces, clear typography, and restrained shadows. No noisy glassmorphism, oversized decoration, or ornamental motion on operational pages.

### Auth Surface Rules

- Auth pages are focused task surfaces: no footer, no marketing sections, no oversized hero block above the form.
- Use the available width on desktop with a balanced two-column or wide panel layout; avoid narrow centered cards unless the viewport is genuinely small.
- On mobile, stack content cleanly with the form first and no horizontal overflow.
- Keep auth navigation compact and token-driven.
- Login, signup, and application forms must provide inline validation, loading states, keyboard support, and French user-facing copy.

## Capgemini Brand Rules

Use the shared logo components:

```tsx
import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons";
```

Standard sizes:

- `sm`
- `md`
- `lg`
- `xl`

Use Capgemini blue through theme variables and Tailwind tokens. Avoid hardcoded color values unless maintaining a dedicated brand constant.

## Toast Notifications

All user-facing notifications must use the unified toast wrapper.

```tsx
import { toast } from "@/components/ui/toast";

toast.success("Opération réussie", {
  description: "Vos modifications ont été enregistrées avec succès.",
});

toast.error("Une erreur est survenue", {
  description: "Impossible de contacter le serveur. Veuillez réessayer plus tard.",
});
```

Rules:

- Use toast for user-facing async success, error, warning, info, and loading feedback.
- Keep toast titles and descriptions in French.
- Pair form toasts with inline validation where the user needs to fix fields.
- Do not use `alert()`, custom notification stacks, or console-only user feedback.

## Forms and Dialogs

Forms must be explicit, accessible, and recoverable:

- Validate fields inline and on submit.
- Disable submit buttons during async work.
- Preserve user-entered values when an error occurs.
- Use clear French labels, placeholders, helper text, and error messages.
- Put destructive actions behind confirmation dialogs.
- Use standard buttons from `components/ui/button`.
- Use standard dialog/sheet/modal primitives from `components/ui` before creating custom containers.

Modal form baseline:

- Header with icon, title, cancel action, and submit action.
- Body uses responsive grids (`grid-cols-1`, then tablet/desktop expansion).
- Save action uses a loading state and `CheckmarkSquare01Icon` when consistent with nearby UI.
- Error and success feedback use `Alert` plus toast where appropriate.

## Data Fetching and API Routes

- Prefer server components for initial data.
- Do not fetch initial page data in `useEffect` when a server component or route-level fetch is appropriate.
- Do not store server state in plain `useState` when caching or server rendering is a better fit.
- Debounce search inputs by at least 300ms.
- Paginate large datasets. Never load full large tables into memory for routine pages.
- Avoid N+1 queries. Use joins, batching, or dedicated service queries.
- Use correct HTTP status codes. Never return `200` for errors.
- Do not expose internal errors, raw SQL, stack traces, or database details to clients.

Structured API error shape:

```ts
return Response.json(
  { error: "Validation failed", details },
  { status: 400 },
);
```

## AI Agent Rules

- Use the AI SDK `tool()` pattern with Zod `inputSchema`.
- Stream responses with `toUIMessageStreamResponse()`.
- Query real database-backed data. Do not fabricate data.
- Include useful visual tool results such as charts or tables when appropriate.
- Persist chat threads and messages.
- Handle tool errors gracefully and explain failures in French to the user.
- Keep tools read-only unless the product flow explicitly approves mutation.
- Never expose raw SQL, database errors, credentials, or stack traces to users.

## Security Rules

- Never commit `.env`, credentials, tokens, API keys, SMTP passwords, or production secrets.
- Authenticate protected API routes before doing work.
- Authorize by employee role or partner identity before returning data.
- Validate file uploads by type, size, and ownership.
- Use httpOnly cookies for auth. Do not move tokens to localStorage.
- Do not log secrets or full tokens.
- Production error messages must be generic and safe.

## Performance Rules

- Keep client components small. Add `"use client"` only when interaction, browser APIs, or client hooks require it.
- Dynamically import heavy client-only components.
- Use Next.js image optimization for real images.
- Prefer server-side aggregation for dashboards.
- Watch bundle impact before adding dependencies.
- Keep animations transform/opacity based where possible.
- Use skeletons or meaningful loading states instead of blank screens.

## Testing and Verification

Before finishing non-trivial work, run the relevant checks:

```bash
bun run lint
bun run build
```

Use narrower checks when the full build is unnecessary, but state exactly what was and was not verified.

For UI changes, manually verify the changed route in the browser across:

- Mobile.
- Tablet.
- Desktop.
- Light mode.
- Dark mode.
- Empty, loading, error, and success data states.

For lib/server/API changes, verify:

- Authenticated and unauthenticated requests.
- Authorized and unauthorized roles.
- Invalid input.
- Empty results.
- Representative successful request.

## Git and File Discipline

- Do not revert user changes unless explicitly asked.
- Do not run destructive git commands such as `git reset --hard` or `git checkout --` without explicit approval.
- Keep commits atomic if asked to commit.
- Do not commit generated build output, `node_modules`, `.next`, local dumps, or secrets.
- Prefer `rg` for search.
- Use `apply_patch` for manual edits.

## Documentation Rules

- Keep project documentation centralized in `README.md`.
- Keep agent and contributor rules in this file.
- Do not create scattered markdown docs unless the user explicitly asks or the file is a generated deliverable.
- Keep docs in sync with code changes in the same turn.
- README is for humans running, understanding, and presenting the project.
- AGENTS.md is for assistants and contributors maintaining the project correctly.

## Done Means

A change is not done until it is:

- Correct for the requested behavior.
- Consistent with existing architecture.
- Type-safe.
- Validated at external boundaries.
- Accessible and responsive when UI is involved.
- Covered by loading, error, empty, and success states where applicable.
- Verified with the strongest practical command or manual test for the change.
- Documented when behavior, setup, or architecture changes.

AVOID THE CARD INSIDE CARD INSIDE CARD SLOPPY DESIGN, ALWAYS MAKE DESIGNS NEXT LEVEL, CLEAN AND ELEGANT.