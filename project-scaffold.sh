#!/bin/bash

# ══════════════════════════════════════════════════════════════════
# project-scaffold.sh
# Drop into any empty project folder and run: bash project-scaffold.sh
# Creates the full VS Code task-driven scaffold workflow.
# ══════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Project Scaffold Installer       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Create directory structure ─────────────────────────────────────
mkdir -p .vscode
mkdir -p .claude/skills
mkdir -p scripts
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types

echo "▸ Writing VS Code config..."

# ── .vscode/tasks.json ─────────────────────────────────────────────
cat > .vscode/tasks.json << 'TASKS'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Scaffold Project",
      "type": "shell",
      "command": "node scripts/scaffold.js",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new",
        "clear": true
      },
      "problemMatcher": []
    },
    {
      "label": "📦 Generate Component",
      "type": "shell",
      "command": "node scripts/generate-component.js '${input:componentName}'",
      "presentation": {
        "reveal": "always",
        "panel": "shared",
        "clear": false
      },
      "problemMatcher": []
    },
    {
      "label": "📝 Refresh README",
      "type": "shell",
      "command": "node scripts/generate-readme.js",
      "presentation": {
        "reveal": "always",
        "panel": "shared",
        "clear": false
      },
      "problemMatcher": []
    },
    {
      "label": "🔍 Review PR",
      "type": "shell",
      "command": "npm run review",
      "presentation": {
        "reveal": "always",
        "panel": "new",
        "clear": true
      },
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "componentName",
      "description": "Component name (PascalCase, e.g. DataTable)",
      "default": "MyComponent",
      "type": "promptString"
    }
  ]
}
TASKS

# ── .vscode/settings.json ──────────────────────────────────────────
cat > .vscode/settings.json << 'SETTINGS'
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true
  }
}
SETTINGS

# ── .vscode/extensions.json ────────────────────────────────────────
cat > .vscode/extensions.json << 'EXT'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens",
    "eamodio.gitlens"
  ]
}
EXT

echo "▸ Writing Claude Code SKILL.md files..."

# ── .claude/SKILL.md ───────────────────────────────────────────────
cat > .claude/SKILL.md << 'SKILL'
# Project Scaffold — Claude Code Context

## Stack
Next.js 14 App Router · TypeScript · Tailwind CSS · React 18

## Path Aliases
Always use path aliases, never relative imports across feature boundaries:
- `@/`            → `src/`
- `@components/`  → `src/components/`
- `@hooks/`       → `src/hooks/`
- `@lib/`         → `src/lib/`
- `@types/`       → `src/types/`

## Naming Conventions
Names follow the convention of the file type or language context — not a single global rule.

| What | Convention | Example |
|---|---|---|
| React components (file + export) | PascalCase | `DataTable.tsx`, `export function DataTable` |
| Component folder | PascalCase | `src/components/DataTable/` |
| Hooks | camelCase with `use` prefix | `use-async.ts`, `export function useAsync` |
| Utility functions / lib files | kebab-case filename, camelCase export | `src/lib/format-date.ts`, `export function formatDate` |
| Route segments (Next.js App Router) | kebab-case | `src/app/user-profile/page.tsx` |
| Config files & scripts | kebab-case | `jest.config.js`, `generate-component.js` |
| TypeScript types and interfaces | PascalCase | `type AsyncState<T>`, `type WithClassName` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_RETRIES = 3` |
| CSS custom properties | kebab-case | `--muted-foreground` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_APP_URL` |

**Why:** Each ecosystem has its own convention — React components are PascalCase so JSX can distinguish them from HTML elements; Next.js file routing is kebab-case to match URL conventions; TypeScript types are PascalCase to mirror class naming; CSS and shell tools use kebab-case by convention. Mixing conventions within a context is a bug.

## Conventions
See `.claude/skills/` for component, API, and testing patterns.

## Hard Rules
- Named exports only — no default exports on components
- No `any` type — use `unknown` with a type guard
- No inline styles — Tailwind classes via `cn()` only
- No files in `/pages` — this project uses App Router
- No class components
SKILL

# ── .claude/skills/component.md ───────────────────────────────────
cat > .claude/skills/component.md << 'COMP'
# Component Conventions

## File Structure
Each component lives in its own folder:
```
src/components/DataTable/
  index.ts            ← barrel export
  DataTable.tsx       ← component
  DataTable.test.tsx  ← co-located test
  DataTable.types.ts  ← types if complex
```

## Anatomy
```tsx
import { cn } from "@lib/utils";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ComponentName({ className, children }: Props) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  );
}
```

## Naming
- **Folder + file + export**: all PascalCase — `DataTable/DataTable.tsx`, `export function DataTable`
- **Test file**: matches component name — `DataTable.test.tsx`
- **Types file**: `DataTable.types.ts` (only if the types are complex enough to split out)
- See `SKILL.md` for naming rules in other contexts (hooks, utils, routes, etc.)

## Rules
- Named exports only
- `className` prop on every leaf component
- Use `cn()` for all class composition
- `forwardRef` only when parent needs the DOM node
- Variants as const object, not ternaries

## Variants Pattern
```tsx
const variants = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-100 text-gray-900",
} as const;
type Variant = keyof typeof variants;
```
COMP

# ── .claude/skills/api.md ─────────────────────────────────────────
cat > .claude/skills/api.md << 'API'
# Data Fetching Conventions

## Server Components (default)
Fetch directly in RSC. No useEffect, no useState for server data.

```tsx
async function getData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <Dashboard data={data} />;
}
```

## Client-Side Async
Use `useAsync` from `@hooks/use-async`:
```tsx
const { state, run } = useAsync<ResponseType>();
// state.status: "idle" | "loading" | "success" | "error"
```

## API Routes
```ts
// src/app/api/[route]/route.ts
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ data: [] });
}
```

## Rules
- Never fetch in useEffect unless triggered by user interaction
- Always handle loading and error states explicitly
- Type every response — never `any`
API

# ── .claude/skills/testing.md ─────────────────────────────────────
cat > .claude/skills/testing.md << 'TEST'
# Testing Conventions

## What Gets Tested
- Unit: pure functions in `/lib`, custom hooks
- Component: user interactions, not implementation details
- Skip: Next.js internals, third-party library behavior

## Pattern
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders with required props", () => {
    render(<ComponentName />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  it("responds to user interaction", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(<ComponentName onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: /action/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

## Rules
- Query by role first, then label, then text
- Test behavior not implementation
- One describe per component, one concept per it
- Mock at the module boundary
TEST

echo "▸ Writing scaffold scripts..."

# ── scripts/scaffold.js ────────────────────────────────────────────
cat > scripts/scaffold.js << 'SCAFFOLD'
#!/usr/bin/env node

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

function write(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function commit(msg) {
  execSync("git add -A");
  execSync("git commit -F -", { input: msg });
}

function buildPackageJson(projectName, problemStatement) {
  return {
    name: projectName,
    version: "0.1.0",
    description: problemStatement,
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "jest --passWithNoTests",
      "test:watch": "jest --watch",
      "type-check": "tsc --noEmit",
      "gen:component": "node scripts/generate-component.js",
      "gen:readme": "node scripts/generate-readme.js",
      "review": "git diff main...HEAD | node scripts/pr-review.js",
    },
    dependencies: {
      next: "^14.2.0",
      react: "^18.3.0",
      "react-dom": "^18.3.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.3.0",
    },
    devDependencies: {
      typescript: "^5.4.5",
      "@types/node": "^20.12.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      tailwindcss: "^3.4.3",
      autoprefixer: "^10.4.19",
      postcss: "^8.4.38",
      eslint: "^8.57.0",
      "eslint-config-next": "^14.2.0",
      prettier: "^3.2.5",
      "@anthropic-ai/sdk": "^0.39.0",
      jest: "^29.7.0",
      "@testing-library/react": "^15.0.6",
      "@testing-library/jest-dom": "^6.4.2",
      "@testing-library/user-event": "^14.5.2",
      "jest-environment-jsdom": "^29.7.0",
    },
  };
}

async function main() {
  // Buffer lines that arrive before ask() is called — happens when stdin is a pipe
  // rather than a TTY, because readline emits all line events synchronously before
  // any await resumes.
  const inputQueue = [];
  const pendingResolvers = [];

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on("line", (line) => {
    if (pendingResolvers.length > 0) {
      pendingResolvers.shift()(line);
    } else {
      inputQueue.push(line);
    }
  });

  const ask = (q) => new Promise((resolve) => {
    process.stdout.write(q);
    if (inputQueue.length > 0) {
      resolve(inputQueue.shift());
    } else {
      pendingResolvers.push(resolve);
    }
  });

  console.log("\n╔══════════════════════════════════╗");
  console.log("║     Project Scaffold Workflow     ║");
  console.log("╚══════════════════════════════════╝\n");

  const projectName      = await ask("Project name (kebab-case): ");
  const problemStatement = await ask("One-line problem statement: ");
  const authorName       = await ask("Your name: ");
  const authorEmail      = await ask("Your email: ");
  rl.close();

  const root = process.cwd();

  console.log("\n▸ Initializing git...");
  if (!fs.existsSync(path.join(root, ".git"))) {
    run("git init");
    spawnSync("git", ["config", "user.name", authorName], { stdio: "inherit" });
    spawnSync("git", ["config", "user.email", authorEmail], { stdio: "inherit" });
  }

  console.log("▸ Writing project files and seeding git history...");
  write("package.json", JSON.stringify(buildPackageJson(projectName, problemStatement), null, 2));

  write("tsconfig.json", JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: {
        "@/*": ["./src/*"],
        "@components/*": ["./src/components/*"],
        "@hooks/*": ["./src/hooks/*"],
        "@lib/*": ["./src/lib/*"],
        "@types/*": ["./src/types/*"],
      },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2));

  write(".npmrc", `save-exact=true\naudit-level=high\nfund=false\n`);
  write(".env.example", `NEXT_PUBLIC_APP_URL=http://localhost:3000\nANTHROPIC_API_KEY=           # needed for npm run review\n`);
  write(".env.local", `# Local env — not committed\n`);
  write(".gitignore", `/node_modules\n/.next\n/out\n.env.local\n.env*.local\n*.tsbuildinfo\n.DS_Store\n`);
  write(".prettierrc", JSON.stringify({ semi: true, singleQuote: false, tabWidth: 2, trailingComma: "es5", printWidth: 100 }, null, 2));
  write(".eslintrc.json", JSON.stringify({ extends: ["next/core-web-vitals"] }, null, 2));

  write("DECISIONS.md", `# Architecture Decision Log\n\n## ADR-001: Next.js App Router\n**Date:** ${new Date().toISOString().split("T")[0]}\n**Status:** Accepted\n\nRSC for data-heavy pages, client components scoped to interactive UI only.\n\n## ADR-002: Tailwind CSS\n**Date:** ${new Date().toISOString().split("T")[0]}\n**Status:** Accepted\n\nTokens in tailwind.config.ts. cn() utility for class composition.\n`);

  write("CHANGELOG.md", `# Changelog\n\n## [Unreleased]\n\n### Added\n- Initial project scaffold\n- Base component architecture\n- TypeScript configuration with path aliases\n`);

  write("src/app/layout.tsx", `import type { Metadata } from "next";\nimport { Inter } from "next/font/google";\nimport "./globals.css";\n\nconst inter = Inter({ subsets: ["latin"] });\n\nexport const metadata: Metadata = {\n  title: "${projectName}",\n  description: "${problemStatement}",\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body className={inter.className}>{children}</body>\n    </html>\n  );\n}\n`);

  write("src/app/globals.css", `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer base {\n  :root {\n    --background: 0 0% 100%;\n    --foreground: 222.2 84% 4.9%;\n    --muted: 210 40% 96.1%;\n    --muted-foreground: 215.4 16.3% 46.9%;\n    --border: 214.3 31.8% 91.4%;\n    --radius: 0.5rem;\n  }\n}\n`);

  write("src/app/page.tsx", `export default function Home() {\n  return (\n    <main className="flex min-h-screen flex-col items-center justify-center p-24">\n      <h1 className="text-4xl font-bold">${projectName}</h1>\n      <p className="mt-4 text-lg text-gray-600">${problemStatement}</p>\n    </main>\n  );\n}\n`);

  write("tailwind.config.ts", `import type { Config } from "tailwindcss";\n\nconst config: Config = {\n  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],\n  theme: {\n    extend: {\n      colors: {\n        background: "hsl(var(--background))",\n        foreground: "hsl(var(--foreground))",\n        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },\n        border: "hsl(var(--border))",\n      },\n      borderRadius: {\n        lg: "var(--radius)",\n        md: "calc(var(--radius) - 2px)",\n        sm: "calc(var(--radius) - 4px)",\n      },\n    },\n  },\n  plugins: [],\n};\n\nexport default config;\n`);

  write("next.config.js", `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;\n`);
  write("postcss.config.js", `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`);
  write("src/components/index.ts", `// Component barrel — updated automatically by generate-component.js\n`);
  commit("chore: initial project scaffold");

  write("src/lib/utils.ts", `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`);
  commit("feat: add cn utility and base lib layer");

  write("src/types/index.ts", `export type WithClassName = {\n  className?: string;\n};\n\nexport type AsyncState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "success"; data: T }\n  | { status: "error"; error: string };\n`);
  commit("feat: add shared TypeScript types");

  write("src/hooks/use-async.ts", `import { useState, useCallback } from "react";\nimport type { AsyncState } from "@types/index";\n\nexport function useAsync<T>() {\n  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });\n\n  const run = useCallback(async (promise: Promise<T>) => {\n    setState({ status: "loading" });\n    try {\n      const data = await promise;\n      setState({ status: "success", data });\n      return data;\n    } catch (err) {\n      const error = err instanceof Error ? err.message : "Unknown error";\n      setState({ status: "error", error });\n      throw err;\n    }\n  }, []);\n\n  const reset = useCallback(() => setState({ status: "idle" }), []);\n  return { state, run, reset };\n}\n`);
  commit("feat: add useAsync hook for typed async state");

  write("jest.config.js", `const nextJest = require("next/jest");\nconst createJestConfig = nextJest({ dir: "./" });\nconst config = {\n  testEnvironment: "jest-environment-jsdom",\n  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],\n  moduleNameMapper: {\n    "^@/(.*)\$": "<rootDir>/src/\$1",\n    "^@components/(.*)\$": "<rootDir>/src/components/\$1",\n    "^@hooks/(.*)\$": "<rootDir>/src/hooks/\$1",\n    "^@lib/(.*)\$": "<rootDir>/src/lib/\$1",\n    "^@types/(.*)\$": "<rootDir>/src/types/\$1",\n  },\n};\nmodule.exports = createJestConfig(config);\n`);
  write("jest.setup.js", `import "@testing-library/jest-dom";\n`);
  write(".github/workflows/ci.yml", `name: CI\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run lint\n\n  type-check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run type-check\n\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm test\n`);
  commit("chore: configure tsconfig path aliases and jest");

  console.log("\n▸ Installing dependencies...");
  run("npm install");
  commit("chore: install dependencies");

  console.log("\n▸ Generating README...");
  run("node scripts/generate-readme.js");
  commit("docs: add project README");

  console.log(`
╔══════════════════════════════════════╗
║  ✓ Scaffold complete                 ║
║                                      ║
║  npm run dev                         ║
║  Task: 📦 Generate Component         ║
║  Task: 📝 Refresh README             ║
╚══════════════════════════════════════╝
`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("\n✗ Scaffold failed:", err.message);
    process.exit(1);
  });
}

module.exports = { write, buildPackageJson };
SCAFFOLD

# ── scripts/generate-component.js ─────────────────────────────────
cat > scripts/generate-component.js << 'GENCOMP'
#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function validateName(name) {
  if (!name) return "Usage: node scripts/generate-component.js ComponentName";
  if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) return "Component name must be PascalCase (e.g. DataTable)";
  return null;
}

function componentTemplate(name) {
  return `import { cn } from "@lib/utils";

type ${name}Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
`;
}

function testTemplate(name) {
  return `import { render, screen } from "@testing-library/react";
import { ${name} } from "./${name}";

describe("${name}", () => {
  it("renders without crashing", () => {
    render(<${name} />);
  });

  it("applies custom className", () => {
    const { container } = render(<${name} className="test-class" />);
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("renders children", () => {
    render(<${name}><span>content</span></${name}>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
`;
}

function barrelTemplate(name) {
  return `export { ${name} } from "./${name}";\n`;
}

function updateBarrel(barrelPath, name) {
  const barrel = fs.readFileSync(barrelPath, "utf8");
  const exportLine = `export * from "./${name}";\n`;
  if (!barrel.includes(exportLine)) fs.appendFileSync(barrelPath, exportLine);
}

if (require.main === module) {
  const name = process.argv[2];

  const error = validateName(name);
  if (error) {
    console.error(`✗ ${error}`);
    process.exit(1);
  }

  const componentDir = path.join("src", "components", name);

  if (fs.existsSync(componentDir)) {
    console.error(`✗ Component "${name}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(componentDir, { recursive: true });
  fs.writeFileSync(path.join(componentDir, `${name}.tsx`), componentTemplate(name));
  fs.writeFileSync(path.join(componentDir, `${name}.test.tsx`), testTemplate(name));
  fs.writeFileSync(path.join(componentDir, "index.ts"), barrelTemplate(name));

  updateBarrel(path.join("src", "components", "index.ts"), name);

  try {
    execSync("git add -A");
    execSync("git commit -F -", { input: `feat: add ${name} component` });
  } catch {}

  console.log(`
✓ Generated ${name}

  src/components/${name}/
    ${name}.tsx
    ${name}.test.tsx
    index.ts
`);
}

module.exports = { validateName, componentTemplate, testTemplate, barrelTemplate, updateBarrel };
GENCOMP

# ── scripts/generate-readme.js ────────────────────────────────────
cat > scripts/generate-readme.js << 'GENREADME'
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function mapDir(dir, indent = 0) {
  if (!fs.existsSync(dir)) return "";
  const prefix = "  ".repeat(indent);
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(i => !i.name.startsWith(".") && i.name !== "node_modules")
    .map(item => item.isDirectory()
      ? `${prefix}${item.name}/\n${mapDir(path.join(dir, item.name), indent + 1)}`
      : `${prefix}${item.name}`)
    .join("\n");
}

function countComponents(baseDir = process.cwd()) {
  const d = path.join(baseDir, "src", "components");
  if (!fs.existsSync(d)) return 0;
  return fs.readdirSync(d, { withFileTypes: true }).filter(i => i.isDirectory()).length;
}

function countTests(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) n += countTests(path.join(dir, item.name));
    else if (item.name.match(/\.test\.(tsx?|jsx?)$/)) n++;
  }
  return n;
}

function buildReadme({ projectName, problemStatement, stack, srcTree, componentCount, testCount, decisions, today }) {
  return `# ${projectName}

> Last generated: ${today}

## Problem Statement

${problemStatement || "_Fill in from your take-home prompt._"}

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Stack

${stack}

## Project Structure

\`\`\`
${srcTree}
\`\`\`

**${componentCount} component${componentCount !== 1 ? "s" : ""}** · **${testCount} test file${testCount !== 1 ? "s" : ""}**

## Scripts

| Command | Description |
|---|---|
| \`npm run dev\` | Start dev server |
| \`npm run build\` | Production build |
| \`npm run test\` | Run test suite |
| \`npm run type-check\` | TypeScript check |
| \`npm run lint\` | ESLint |
| \`node scripts/generate-component.js Name\` | Scaffold a component |
| \`node scripts/generate-readme.js\` | Refresh this README |

## Architecture Decisions

${decisions}

Full reasoning in [DECISIONS.md](./DECISIONS.md).

## Trade-offs & What I'd Do Next

_Fill this in before submitting._

- [ ] Add Storybook or \`/design-system\` route for component docs
- [ ] Add E2E tests with Playwright for critical flows
- [ ] Set up CI with GitHub Actions (lint → type-check → test)
- [ ] Add error boundaries per route segment

## Environment Variables

Copy \`.env.example\` to \`.env.local\`. Never commit \`.env.local\`.

---

_README generated by \`scripts/generate-readme.js\` — run "📝 Refresh README" task to update._
`;
}

if (require.main === module) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const projectName = pkg.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const problemStatement = pkg.description || "";

  let decisions = "_See DECISIONS.md_";
  if (fs.existsSync("DECISIONS.md")) {
    const raw = fs.readFileSync("DECISIONS.md", "utf8");
    const titles = [...raw.matchAll(/^## (ADR-\d+: .+)$/gm)].map(m => `- ${m[1]}`);
    if (titles.length) decisions = titles.join("\n");
  }

  const srcTree = mapDir("src");
  const componentCount = countComponents(process.cwd());
  const testCount = countTests("src");
  const today = new Date().toISOString().split("T")[0];
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack = [
    deps.next && `Next.js ${deps.next.replace(/[\^~]/, "")}`,
    deps.react && `React ${deps.react.replace(/[\^~]/, "")}`,
    deps.typescript && `TypeScript ${deps.typescript.replace(/[\^~]/, "")}`,
    deps.tailwindcss && "Tailwind CSS",
    deps.jest && "Jest + React Testing Library",
  ].filter(Boolean).join(" · ");

  const readme = buildReadme({ projectName, problemStatement, stack, srcTree, componentCount, testCount, decisions, today });
  fs.writeFileSync("README.md", readme, "utf8");
  console.log("✓ README.md updated");
}

module.exports = { mapDir, countComponents, countTests, buildReadme };
GENREADME

cat > scripts/pr-review.js << 'PRREVIEW'
#!/usr/bin/env node

// CI-only script: reads a unified diff from stdin, streams a code review
// to stdout via the Anthropic API.
// Usage: gh pr diff <number> | node scripts/pr-review.js
//
// Requires ANTHROPIC_API_KEY environment variable.

const SYSTEM_PROMPT = `You are an expert code reviewer specializing in Next.js App Router, React 18+, and TypeScript. You will be given a unified diff. Analyze ONLY the changed lines (starting with + or -), not the context lines.

## Review scopes

**Architecture**
- Flag \`'use client'\` placed too high — data fetching should start server-side; the client boundary should wrap only the interactive leaf
- Flag god components (fetch + state + render in one file) — suggest extracting a named custom hook
- Flag direct browser-to-third-party API calls — suggest a server-side Route Handler (gains caching, rate limiting, CORS safety)
- Flag ephemeral React state for values that should survive refresh or sharing — use URL search params instead
- Flag business/policy logic (content filtering, access control) inside display components

**Code Quality**
- Missing \`r.ok\` check before \`.json()\` — \`fetch\` resolves on any HTTP status; only rejects on network failure
- \`useEffect\` fetch with no \`AbortController\` — race condition on rapid input, stale state update on unmount
- Error state set but never reset — stale error shown after a successful retry
- \`isLoading\` initialized to \`true\` before any action has occurred
- In-place \`Array.sort()\` on a prop — mutates parent state, violates React's read-only prop contract
- \`key={index}\` on a list that sorts or filters — incorrect DOM reconciliation
- Sort or filter in render body without \`useMemo\` when data could be large
- Unnecessary \`'use client'\` on a component with no hooks, event handlers, or browser APIs

**Security**
- User input interpolated into URLs without \`encodeURIComponent\` — breaks multi-word input, corrupts query strings
- \`dangerouslySetInnerHTML\` without sanitization
- Hardcoded secrets or credentials in source
- OWASP Top 10 patterns (injection, broken auth, sensitive data exposure)

**Style & Conventions**
- \`<img>\` with \`eslint-disable\` comment instead of \`next/image\` — loses lazy loading, responsive srcset, WebP conversion
- Build tools or test runners in \`dependencies\` instead of \`devDependencies\`
- TypeScript: \`any\` type, interface duplicating another instead of \`Pick\`, name shadowing a global (e.g. \`Response\` shadows the Web API \`Response\`)
- Semantic HTML: spacer elements (\`<p>&nbsp;</p>\`), \`<button>\` without \`type="button"\`
- Naming: PascalCase directory for components (should be lowercase), mixed casing conventions across the project

## Output format

### Summary
One or two sentences on overall quality and risk level.

### Findings
Each finding on its own line:
- **[SCOPE] SEVERITY** \`file:line\` — Description and one-line fix.

Severity: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | ✅ Good (notable positives)

Omit \`file:line\` for architectural issues with no single source line.

### Verdict
**Approve** | **Request Changes** | **Needs Discussion** — one-line rationale.

Be direct and specific. Reference actual code from the diff. If the diff is clean, say so concisely.`;

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set.");
    console.error("Add it to .env.local or export it in your shell profile (~/.zshrc or ~/.bashrc).");
    process.exit(1);
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const rawDiff = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawDiff) {
    console.error("No diff provided on stdin");
    process.exit(1);
  }

  // Strip context lines — focus Claude on the actual changes
  const diff = rawDiff
    .split("\n")
    .filter(
      (l) =>
        l.startsWith("+") ||
        l.startsWith("-") ||
        l.startsWith("@@") ||
        l.startsWith("diff --git") ||
        l.startsWith("---") ||
        l.startsWith("+++")
    )
    .join("\n");

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  process.stdout.write("## Claude Code Review\n\n");

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Review this pull request diff:\n\n\`\`\`diff\n${diff}\n\`\`\``,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  process.stdout.write("\n");
}

main().catch((err) => {
  console.error("Review failed:", err.message);
  process.exit(1);
});
PRREVIEW

# ── Root README ────────────────────────────────────────────────────
if [ ! -f README.md ]; then
cat > README.md << 'ROOTREADME'
# project-scaffold

VS Code task-driven scaffolding workflow for 48-72hr take-home assignments.

## Usage

```bash
bash project-scaffold.sh   # installs the workflow files
code .                     # open in VS Code
# Cmd+Shift+B → 🚀 Scaffold Project
```

## The Three Tasks

| Task | What it does |
|---|---|
| 🚀 Scaffold Project | Full setup: configs, base files, npm install, git history |
| 📦 Generate Component | Component + test + barrel export + git commit |
| 📝 Refresh README | Reads project state → regenerates README.md |

## Requirements
- Node.js 18+  
- npm  
- git
ROOTREADME
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  ✓ Workflow files installed          ║"
echo "║                                      ║"
echo "║  Open in VS Code:  code .            ║"
echo "║  Then: Cmd+Shift+B                   ║"
echo "║  → 🚀 Scaffold Project               ║"
echo "╚══════════════════════════════════════╝"
echo ""
