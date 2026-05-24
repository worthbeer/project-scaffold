#!/usr/bin/env node

// PR reviewer: reads a unified diff from stdin and streams a structured
// code review via the claude CLI (uses Claude Code's existing auth).
// Usage: git diff main...HEAD | node scripts/pr-review.js

const { spawn } = require("child_process");

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

  const userMessage = `Review this pull request diff:\n\n\`\`\`diff\n${diff}\n\`\`\``;

  process.stdout.write("## Claude Code Review\n\n");

  await new Promise((resolve, reject) => {
    const proc = spawn(
      "claude",
      [
        "--print",
        "--no-session-persistence",
        "--system-prompt", SYSTEM_PROMPT,
        "--model", "sonnet",
        userMessage,
      ],
      { stdio: ["ignore", "pipe", "inherit"] }
    );

    proc.stdout.pipe(process.stdout);

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`claude exited with code ${code}`));
    });
  });

  process.stdout.write("\n");
}

main().catch((err) => {
  console.error("Review failed:", err.message);
  process.exit(1);
});
