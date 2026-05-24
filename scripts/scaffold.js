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
  write(".env.example", `NEXT_PUBLIC_APP_URL=http://localhost:3000\n`);
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
║  CI: lint · type-check · test        ║
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
