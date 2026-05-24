/** @jest-environment node */

const { buildPackageJson } = require("../scaffold");

describe("buildPackageJson", () => {
  it("sets name from projectName", () => {
    const pkg = buildPackageJson("my-project", "A problem statement.");
    expect(pkg.name).toBe("my-project");
  });

  it("sets description from problemStatement", () => {
    const pkg = buildPackageJson("my-project", "Developers need X but Y.");
    expect(pkg.description).toBe("Developers need X but Y.");
  });

  it("preserves special characters in the problem statement", () => {
    const statement = `It's "tricky" & uses $pecial chars`;
    const pkg = buildPackageJson("proj", statement);
    expect(pkg.description).toBe(statement);
  });

  it("includes @testing-library/user-event in devDependencies", () => {
    const pkg = buildPackageJson("proj", "stmt");
    expect(pkg.devDependencies["@testing-library/user-event"]).toBeDefined();
  });

  it("includes eslint-config-next in devDependencies", () => {
    const pkg = buildPackageJson("proj", "stmt");
    expect(pkg.devDependencies["eslint-config-next"]).toBeDefined();
  });


  it("includes required npm scripts", () => {
    const pkg = buildPackageJson("proj", "stmt");
    expect(pkg.scripts.dev).toBe("next dev");
    expect(pkg.scripts.test).toBe("jest --passWithNoTests");
    expect(pkg.scripts.lint).toBe("next lint");
    expect(pkg.scripts["type-check"]).toBe("tsc --noEmit");
    expect(pkg.scripts.review).toMatch(/pr-review\.js/);
  });

  it("marks the package as private", () => {
    const pkg = buildPackageJson("proj", "stmt");
    expect(pkg.private).toBe(true);
  });
});
