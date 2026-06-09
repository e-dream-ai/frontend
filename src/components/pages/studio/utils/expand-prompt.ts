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

function crossProduct(segments: ParsedSegment[]): string[] {
  let results = [""];

  for (const seg of segments) {
    if (seg.type === "literal") {
      results = results.map((r) => r + seg.value);
    } else {
      const next: string[] = [];
      for (const r of results) {
        for (const opt of seg.options) {
          next.push(r + opt);
        }
      }
      results = next;
    }
  }

  return results;
}

const MAX_EXPANSIONS = 16;

export function expandPrompt(template: string): string[] {
  if (!template) return [template];
  const segments = parse(template);
  const results = crossProduct(segments);
  return results.slice(0, MAX_EXPANSIONS);
}

export function countExpansions(template: string): number {
  if (!template) return 1;
  const segments = parse(template);
  let count = 1;
  for (const seg of segments) {
    if (seg.type === "group") {
      count *= seg.options.length;
    }
  }
  return Math.min(count, MAX_EXPANSIONS);
}
