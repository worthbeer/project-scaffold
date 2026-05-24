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
