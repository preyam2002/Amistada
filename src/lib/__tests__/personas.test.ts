import { describe, it, expect } from "vitest";
import { AMISTALA_PERSONAS, PERSONA_NAMES } from "../personas";

describe("AMISTALA_PERSONAS", () => {
  it("has 8 personas", () => {
    expect(AMISTALA_PERSONAS).toHaveLength(8);
  });

  it("each persona has name and description", () => {
    for (const p of AMISTALA_PERSONAS) {
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(typeof p.name).toBe("string");
      expect(typeof p.description).toBe("string");
    }
  });

  it("includes expected archetypes", () => {
    const names = AMISTALA_PERSONAS.map((p) => p.name);
    expect(names).toContain("The Poet");
    expect(names).toContain("The Architect");
    expect(names).toContain("The Explorer");
    expect(names).toContain("The Creator");
  });

  it("has no duplicate names", () => {
    const names = AMISTALA_PERSONAS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("PERSONA_NAMES", () => {
  it("matches persona count", () => {
    expect(PERSONA_NAMES).toHaveLength(AMISTALA_PERSONAS.length);
  });

  it("contains only string values", () => {
    for (const name of PERSONA_NAMES) {
      expect(typeof name).toBe("string");
    }
  });
});
