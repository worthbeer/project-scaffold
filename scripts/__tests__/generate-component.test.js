/** @jest-environment node */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { validateName, componentTemplate, testTemplate, barrelTemplate, updateBarrel } = require("../generate-component");

describe("validateName", () => {
  it("returns error for missing name", () => {
    expect(validateName(undefined)).not.toBeNull();
    expect(validateName("")).not.toBeNull();
  });

  it("returns error for lowercase-starting names", () => {
    expect(validateName("myComponent")).not.toBeNull();
    expect(validateName("button")).not.toBeNull();
  });

  it("returns error for kebab-case names", () => {
    expect(validateName("my-component")).not.toBeNull();
  });

  it("returns error for names starting with a digit", () => {
    expect(validateName("123Component")).not.toBeNull();
  });

  it("returns null for valid PascalCase names", () => {
    expect(validateName("DataTable")).toBeNull();
    expect(validateName("UserProfile")).toBeNull();
    expect(validateName("Button")).toBeNull();
    expect(validateName("MyComponent2")).toBeNull();
  });
});

describe("componentTemplate", () => {
  it("produces a named export matching the component name", () => {
    expect(componentTemplate("DataTable")).toContain("export function DataTable");
  });

  it("produces a Props type prefixed with the component name", () => {
    expect(componentTemplate("DataTable")).toContain("type DataTableProps");
  });

  it("uses cn() for className composition", () => {
    expect(componentTemplate("Button")).toContain("cn(");
  });

  it("accepts a className prop", () => {
    expect(componentTemplate("Card")).toContain("className");
  });
});

describe("testTemplate", () => {
  it("imports from the sibling component file", () => {
    expect(testTemplate("DataTable")).toContain('from "./DataTable"');
  });

  it("wraps tests in a describe block named after the component", () => {
    expect(testTemplate("DataTable")).toContain('describe("DataTable"');
  });

  it("includes a smoke-test case", () => {
    expect(testTemplate("DataTable")).toContain("renders without crashing");
  });
});

describe("barrelTemplate", () => {
  it("produces a named re-export for the component", () => {
    expect(barrelTemplate("DataTable")).toBe('export { DataTable } from "./DataTable";\n');
  });
});

describe("updateBarrel", () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `barrel-${Date.now()}.ts`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it("appends the export line when it is not already present", () => {
    fs.writeFileSync(tmpFile, "// existing exports\n");
    updateBarrel(tmpFile, "NewComponent");
    expect(fs.readFileSync(tmpFile, "utf8")).toContain('export * from "./NewComponent";\n');
  });

  it("does not duplicate the export line on a second call", () => {
    fs.writeFileSync(tmpFile, "");
    updateBarrel(tmpFile, "NewComponent");
    updateBarrel(tmpFile, "NewComponent");
    const matches = fs.readFileSync(tmpFile, "utf8").match(/export \* from "\.\/NewComponent"/g);
    expect(matches).toHaveLength(1);
  });

  it("preserves existing exports when appending", () => {
    fs.writeFileSync(tmpFile, 'export * from "./Button";\n');
    updateBarrel(tmpFile, "Card");
    const content = fs.readFileSync(tmpFile, "utf8");
    expect(content).toContain('export * from "./Button";\n');
    expect(content).toContain('export * from "./Card";\n');
  });
});
