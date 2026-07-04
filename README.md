# @shared/ui

A shared, versioned UI component library built with [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS v4](https://tailwindcss.com), and [Radix UI](https://www.radix-ui.com). Published to npm (or installable from GitHub) so multiple Next.js apps can consume it with independent semver.

```
app1  ──►  npm install @shared/ui@1.2.0
app2  ──►  npm install github:illarock/shared-ui#main
```

## Why this approach?

| Approach | Versioning | Rollback | Per-app updates |
|---|---|---|---|
| Git submodules | Manual | Hard | Coupled |
| Install from Git URL | Tags only | Awkward | Coupled |
| **Published package** | **Semver** | **`npm install @shared/ui@1.1.0`** | **Independent** |

---

## Requirements

**Consuming apps**

- Next.js 15+ (App Router)
- React 18 or 19
- Tailwind CSS v4 + `@tailwindcss/postcss`

**This repo**

- Node.js 20+
- npm

---

## Quick start (Next.js app)

### 1. Install

```bash
# npm (recommended)
npm install @shared/ui

# GitHub
npm install github:illarock/shared-ui
```

The `prepare` script builds `dist/` on install. After updates:

```bash
rm -rf node_modules/@shared/ui && npm install github:illarock/shared-ui
```

### 2. PostCSS

```js
// postcss.config.mjs
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};
export default config;
```

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

### 3. Global styles

```css
/* app/globals.css */
@import "tailwindcss";
@import "@shared/ui/styles.css";

@source "./**/*.{ts,tsx}";
```

```tsx
// app/layout.tsx
import "./globals.css";
```

`@shared/ui/styles.css` is **pre-built** and includes theme tokens, shadcn styles, and all utility classes used by package components (`bg-primary`, `rounded-md`, etc.).

> Use `@shared/ui/styles.css` or `@shared/ui/globals.css` (alias). **Do not** import `@shared/ui/styles/globals.css` — that is raw source without compiled utilities.

### 4. Next.js config

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shared/ui"],
};

export default nextConfig;
```

If Turbopack fails to resolve `@shared/ui/*` imports during `next build`, use webpack:

```bash
next build --webpack
```

### 5. Use components

```tsx
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button>Click me</Button>
        <Badge>New</Badge>
      </CardContent>
    </Card>
  );
}
```

---

## Package exports

| Import | Description |
|---|---|
| `@shared/ui/styles.css` | Pre-built CSS (theme + component utilities) |
| `@shared/ui/globals.css` | Alias for `styles.css` |
| `@shared/ui/button` | Component (shorthand) |
| `@shared/ui/components/button` | Component (explicit) |
| `@shared/ui/lib/utils` | `cn()` helper |
| `@shared/ui/hooks/*` | Hooks (when added) |

Exports are auto-generated on build for each component in `src/components/`.

---

## Theming

Tokens live in `src/styles/theme.css` and are compiled into `dist/styles.css`.

**Dark mode** — add `.dark` to a parent:

```tsx
<html lang="en" className={isDark ? "dark" : ""}>
```

**Override fonts** in your app:

```css
:root {
  --font-sans: "Your Font", sans-serif;
}
```

---

## Developing this library

### Structure

```
shared-ui/
├── src/
│   ├── components/     # shadcn components (button, card, badge, …)
│   ├── hooks/
│   ├── lib/utils.ts
│   └── styles/
│       ├── build.css   # Tailwind build entry (dev only)
│       ├── globals.css # Source tailwind entry (dev only)
│       ├── theme.css
│       ├── base.css
│       ├── components.css
│       └── utilities.css
├── dist/               # Published output (gitignored)
│   ├── components/
│   ├── lib/
│   └── styles.css      # Pre-built CSS for consumers
├── scripts/
│   └── generate-exports.mjs
├── components.json     # shadcn CLI config
└── tsup.config.ts
```

### Scripts

| Command | Description |
|---|---|
| `npm run build` | Build JS (`dist/components/`) + CSS (`dist/styles.css`) + exports |
| `npm run dev` | Watch mode for components |
| `npm run typecheck` | TypeScript check |
| `npm run changeset` | Create a changeset for release |
| `npm run release` | Build + publish to npm |

### Adding components with shadcn CLI

Run from the **repo root**:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add input label
```

`components.json` aliases (required for CLI):

```json
{
  "aliases": {
    "components": "#components",
    "ui": "#components",
    "lib": "#lib",
    "hooks": "#hooks",
    "utils": "#lib/utils"
  }
}
```

After adding components:

```bash
npm run build        # rebuilds dist/ + updates package.json exports
npm run changeset    # document the change for release
```

The build pipeline:

1. **tsup** — compiles `src/components/*.tsx` → `dist/components/*.js` + types
2. **generate-exports.mjs** — adds `./button`, `./components/button`, etc. to `package.json`
3. **@tailwindcss/cli** — compiles `src/styles/build.css` → `dist/styles.css` with all component utilities

---

## Publishing

Uses [Changesets](https://github.com/changesets/changesets). See [Publishing & versioning](#publishing--versioning) below for npm setup.

```bash
npm run changeset    # describe change
# merge Version Packages PR
# CI publishes automatically
```

---

## Local linking

```bash
# In shared-ui
npm run build

# In your Next.js app
npm install file:../shared-ui
```

Re-run `npm run build` in `shared-ui` after every change.

---

## Publishing & versioning

### One-time npm setup

1. Create `@shared` org at [npmjs.com/org/create](https://www.npmjs.com/org/create) (or rename package to `@yourscope/ui`)
2. Add `NPM_TOKEN` to GitHub repo secrets (publish access to scope)
3. Commit `package-lock.json` in sync with `package.json`

### Release flow

```
1. Merge PR with .changeset/*.md
2. CI opens "Version Packages" PR
3. Merge it → version bump + CHANGELOG.md
4. CI runs npm run release
5. Apps install @shared/ui@x.y.z when ready
```

### Manual publish

```bash
npm login
npm run build
npm publish --access public
```

---

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | PR + push to `main` | `npm ci`, build, typecheck |
| `release.yml` | push to `main` | Changesets version PR or npm publish |

---

## Troubleshooting

### Components look unstyled

```css
@import "tailwindcss";
@import "@shared/ui/styles.css";
@source "./**/*.{ts,tsx}";
```

- Do **not** use `@source "../node_modules/@shared/ui/..."` — Tailwind v4 won't scan it
- Do **not** import `@shared/ui/styles/globals.css` in layout
- Reinstall after updating: `rm -rf node_modules/@shared/ui && npm install github:illarock/shared-ui`

### `Module not found: @shared/ui/button`

1. Confirm `node_modules/@shared/ui/dist/components/button.js` exists
2. Add `transpilePackages: ["@shared/ui"]` to `next.config.ts`
3. Try `next build --webpack` if Turbopack can't resolve exports
4. Reinstall to trigger `prepare` build

### shadcn `add` fails

Run from repo root. Ensure `components.json` has `"utils": "#lib/utils"` (not a relative path).

### npm publish `E404`

The `@shared` scope doesn't exist on npm yet. Create the org or rename the package.

### `npm ci` fails in CI

Run `npm install` locally and commit the updated `package-lock.json`.

---

## License

MIT
