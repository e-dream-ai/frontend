import { describe, it, expect } from "vitest";
import { createComboKey } from "./studio.types";

describe("createComboKey", () => {
  it("returns format uuid:hash", () => {
    const key = createComboKey("abc-123", "test prompt");
    expect(key).toMatch(/^abc-123:[0-9a-f]{8}$/);
  });

  it("produces consistent output for same inputs", () => {
    const key1 = createComboKey("uuid-1", "hello world");
    const key2 = createComboKey("uuid-1", "hello world");
    expect(key1).toBe(key2);
  });

  it("produces different hashes for different prompts", () => {
    const key1 = createComboKey("uuid-1", "prompt A");
    const key2 = createComboKey("uuid-1", "prompt B");
    const hash1 = key1.split(":")[1];
    const hash2 = key2.split(":")[1];
    expect(hash1).not.toBe(hash2);
  });

  it("never produces negative hex characters", () => {
    // Test with strings that would produce negative hash values
    const testPrompts = [
      "a",
      "test",
      "negative hash test string",
      "another test to ensure no negative",
      "zzzzzzzzzzzzzzz",
      "",
    ];

    for (const prompt of testPrompts) {
      const key = createComboKey("uuid", prompt);
      const hash = key.split(":")[1];
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
      expect(hash).not.toContain("-");
    }
  });

  it("always produces exactly 8 hex characters", () => {
    // Short prompts that might produce small hash values
    const key = createComboKey("uuid", "a");
    const hash = key.split(":")[1];
    expect(hash).toHaveLength(8);
  });
});
