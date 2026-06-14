// src/components/pages/studio/utils/expand-prompt.ts

interface ParsedSegment {
  type: "literal" | "group";
  value: string;
  options: string[];
}

function parse(template: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let current = "";
  let i = 0;

  while (i < template.length) {
    if (
      template[i] === "\\" &&
      (template[i + 1] === "{" || template[i + 1] === "}")
    ) {
      current += template[i + 1];
      i += 2;
      continue;
    }

    if (template[i] === "{") {
      if (current) {
        segments.push({ type: "literal", value: current, options: [] });
        current = "";
      }
      const closeIdx = template.indexOf("}", i);
      if (closeIdx === -1) {
        current += template[i];
        i++;
        continue;
      }
      const inner = template.slice(i + 1, closeIdx);
      const options = inner.split("|").map((s) => s.trim());
      segments.push({ type: "group", value: "", options });
      i = closeIdx + 1;
      continue;
    }

    current += template[i];
    i++;
  }

  if (current) {
    segments.push({ type: "literal", value: current, options: [] });
  }

  return segments;
}

export const MAX_EXPANSIONS = 16;

// Builds the cross-product but never grows beyond `limit` entries. Capping
// here (rather than slicing a fully-materialized product) is essential: a
// prompt with many groups expands exponentially, so building the full product
// first would freeze or OOM the tab before the cap is ever applied.
function crossProduct(segments: ParsedSegment[], limit: number): string[] {
  let results = [""];

  for (const seg of segments) {
    if (seg.type === "literal") {
      results = results.map((r) => r + seg.value);
    } else {
      const next: string[] = [];
      outer: for (const r of results) {
        for (const opt of seg.options) {
          next.push(r + opt);
          if (next.length >= limit) break outer;
        }
      }
      results = next;
    }
  }

  return results.slice(0, limit);
}

export function expandPrompt(template: string): string[] {
  if (!template) return [template];
  const segments = parse(template);
  return crossProduct(segments, MAX_EXPANSIONS);
}

// Uncapped count of how many combinations the template would expand to. Pure
// multiplication — never materializes the product, so it's safe for any input.
export function countRawExpansions(template: string): number {
  if (!template) return 1;
  const segments = parse(template);
  let count = 1;
  for (const seg of segments) {
    if (seg.type === "group") {
      count *= seg.options.length;
    }
  }
  return count;
}

export function countExpansions(template: string): number {
  return Math.min(countRawExpansions(template), MAX_EXPANSIONS);
}
