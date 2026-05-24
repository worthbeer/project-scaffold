/** @jest-environment node */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { mapDir, countComponents, countTests, buildReadme } = require("../generate-readme");

function makeTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "readme-test-"));
}

describe("mapDir", () => {
  it("returns empty string for a non-existent directory", () => {
    expect(mapDir("/nonexistent/path/xyz")).toBe("");
  });

  it("lists files at the top level", () => {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, "page.tsx"), "");
    expect(mapDir(tmp)).toContain("page.tsx");
    fs.rmSync(tmp, { recursive: true });
  });

  it("lists subdirectories with a trailing slash", () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, "components"));
    const result = mapDir(tmp);
    expect(result).toContain("components/");
    fs.rmSync(tmp, { recursive: true });
  });

  it("indents nested entries", () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, "sub"));
    fs.writeFileSync(path.join(tmp, "sub", "inner.ts"), "");
    const result = mapDir(tmp);
    expect(result).toMatch(/  inner\.ts/);
    fs.rmSync(tmp, { recursive: true });
  });

  it("excludes dotfiles and node_modules", () => {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, ".env"), "");
    fs.mkdirSync(path.join(tmp, "node_modules"));
    const result = mapDir(tmp);
    expect(result).not.toContain(".env");
    expect(result).not.toContain("node_modules");
    fs.rmSync(tmp, { recursive: true });
  });
});

describe("countComponents", () => {
  it("returns 0 when the components directory does not exist", () => {
    const tmp = makeTmp();
    expect(countComponents(tmp)).toBe(0);
    fs.rmSync(tmp, { recursive: true });
  });

  it("counts component subdirectories", () => {
    const tmp = makeTmp();
    const compsDir = path.join(tmp, "src", "components");
    fs.mkdirSync(path.join(compsDir, "Button"), { recursive: true });
    fs.mkdirSync(path.join(compsDir, "Card"), { recursive: true });
    fs.writeFileSync(path.join(compsDir, "index.ts"), "");
    expect(countComponents(tmp)).toBe(2);
    fs.rmSync(tmp, { recursive: true });
  });
});

describe("countTests", () => {
  it("returns 0 for a non-existent directory", () => {
    expect(countTests("/nonexistent/path/xyz")).toBe(0);
  });

  it("counts .test.tsx files", () => {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, "Button.test.tsx"), "");
    expect(countTests(tmp)).toBe(1);
    fs.rmSync(tmp, { recursive: true });
  });

  it("counts .test.ts files", () => {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, "utils.test.ts"), "");
    expect(countTests(tmp)).toBe(1);
    fs.rmSync(tmp, { recursive: true });
  });

  it("counts test files recursively across subdirectories", () => {
    const tmp = makeTmp();
    fs.mkdirSync(path.join(tmp, "Button"));
    fs.writeFileSync(path.join(tmp, "Button", "Button.test.tsx"), "");
    fs.writeFileSync(path.join(tmp, "utils.test.ts"), "");
    expect(countTests(tmp)).toBe(2);
    fs.rmSync(tmp, { recursive: true });
  });

  it("ignores non-test files", () => {
    const tmp = makeTmp();
    fs.writeFileSync(path.join(tmp, "Button.tsx"), "");
    fs.writeFileSync(path.join(tmp, "utils.ts"), "");
    expect(countTests(tmp)).toBe(0);
    fs.rmSync(tmp, { recursive: true });
  });
});

describe("buildReadme", () => {
  const base = {
    projectName: "My Project",
    problemStatement: "Developers need to ship faster but waste time on setup.",
    stack: "Next.js 14.2.0 · React 18.3.0 · TypeScript 5.4.5 · Tailwind CSS",
    srcTree: "app/\n  page.tsx\ncomponents/",
    componentCount: 2,
    testCount: 3,
    decisions: "- ADR-001: Next.js App Router\n- ADR-002: Tailwind CSS",
    today: "2026-05-24",
  };

  it("opens with the project name as an h1", () => {
    expect(buildReadme(base)).toMatch(/^# My Project/);
  });

  it("includes the problem statement", () => {
    expect(buildReadme(base)).toContain("Developers need to ship faster");
  });

  it("falls back to placeholder when problemStatement is empty", () => {
    const out = buildReadme({ ...base, problemStatement: "" });
    expect(out).toContain("_Fill in from your take-home prompt._");
  });

  it("falls back to placeholder when problemStatement is omitted", () => {
    const { problemStatement: _, ...rest } = base;
    const out = buildReadme({ ...rest, problemStatement: undefined });
    expect(out).toContain("_Fill in from your take-home prompt._");
  });

  it("includes the last-generated date", () => {
    expect(buildReadme(base)).toContain("2026-05-24");
  });

  it("reports component count correctly", () => {
    expect(buildReadme(base)).toContain("2 components");
    expect(buildReadme({ ...base, componentCount: 1 })).toContain("1 component");
    expect(buildReadme({ ...base, componentCount: 1 })).not.toContain("1 components");
  });

  it("reports test file count correctly", () => {
    expect(buildReadme(base)).toContain("3 test files");
    expect(buildReadme({ ...base, testCount: 1 })).toContain("1 test file");
    expect(buildReadme({ ...base, testCount: 1 })).not.toContain("1 test files");
  });

  it("includes ADR titles from decisions", () => {
    expect(buildReadme(base)).toContain("ADR-001");
  });
});
