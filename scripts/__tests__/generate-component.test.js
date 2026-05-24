/** @jest-environment node */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { validateName, componentTemplate, testTemplate, barrelTemplate, updateBarrel } = require("../generate-component");

const SCRIPT = path.join(__dirname, "..", "generate-component.js");

function makeProjectDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gen-component-e2e-"));
  spawnSync("git", ["init"], { cwd: dir });
  spawnSync("git", ["config", "user.name", "Test"], { cwd: dir });
  spawnSync("git", ["config", "user.email", "test@test.com"], { cwd: dir });
  fs.mkdirSync(path.join(dir, "src", "components"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "components", "index.ts"), "// barrel\n");
  spawnSync("git", ["add", "-A"], { cwd: dir });
  spawnSync("git", ["commit", "-m", "initial"], { cwd: dir });
  return dir;
}

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

describe("CLI — end-to-end", () => {
  let tmpDir;

  beforeEach(() => { tmpDir = makeProjectDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("creates component, test, and index files", () => {
    const result = spawnSync("node", [SCRIPT, "Button"], { cwd: tmpDir, encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, "src", "components", "Button", "Button.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "src", "components", "Button", "Button.test.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "src", "components", "Button", "index.ts"))).toBe(true);
  });

  it("component file contains the named export", () => {
    spawnSync("node", [SCRIPT, "DataTable"], { cwd: tmpDir, encoding: "utf8" });
    const content = fs.readFileSync(path.join(tmpDir, "src", "components", "DataTable", "DataTable.tsx"), "utf8");
    expect(content).toContain("export function DataTable");
  });

  it("updates the barrel index", () => {
    spawnSync("node", [SCRIPT, "Card"], { cwd: tmpDir, encoding: "utf8" });
    const barrel = fs.readFileSync(path.join(tmpDir, "src", "components", "index.ts"), "utf8");
    expect(barrel).toContain('export * from "./Card"');
  });

  it("commits the component to git", () => {
    spawnSync("node", [SCRIPT, "Modal"], { cwd: tmpDir, encoding: "utf8" });
    const log = spawnSync("git", ["log", "--oneline"], { cwd: tmpDir, encoding: "utf8" });
    expect(log.stdout).toContain("feat: add Modal component");
  });

  it("exits 1 with a PascalCase error for an invalid name", () => {
    const result = spawnSync("node", [SCRIPT, "myComponent"], { cwd: tmpDir, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("PascalCase");
  });

  it("exits 1 when the component already exists", () => {
    spawnSync("node", [SCRIPT, "Button"], { cwd: tmpDir, encoding: "utf8" });
    const result = spawnSync("node", [SCRIPT, "Button"], { cwd: tmpDir, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("already exists");
  });
});
