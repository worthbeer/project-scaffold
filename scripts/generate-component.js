#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const name = process.argv[2];

if (!name) {
  console.error("✗ Usage: node scripts/generate-component.js ComponentName");
  process.exit(1);
}

if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) {
  console.error("✗ Component name must be PascalCase (e.g. DataTable)");
  process.exit(1);
}

const componentDir = path.join("src", "components", name);

if (fs.existsSync(componentDir)) {
  console.error(`✗ Component "${name}" already exists`);
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });

fs.writeFileSync(path.join(componentDir, `${name}.tsx`),
`import { cn } from "@lib/utils";

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
`);

fs.writeFileSync(path.join(componentDir, `${name}.test.tsx`),
`import { render, screen } from "@testing-library/react";
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
`);

fs.writeFileSync(path.join(componentDir, "index.ts"),
`export { ${name} } from "./${name}";\n`);

const barrelPath = path.join("src", "components", "index.ts");
const barrel = fs.readFileSync(barrelPath, "utf8");
const exportLine = `export * from "./${name}";\n`;
if (!barrel.includes(exportLine)) fs.appendFileSync(barrelPath, exportLine);

try {
  execSync("git add -A");
  execSync(`git commit -m "feat: add ${name} component"`);
} catch {}

console.log(`
✓ Generated ${name}

  src/components/${name}/
    ${name}.tsx
    ${name}.test.tsx
    index.ts
`);
