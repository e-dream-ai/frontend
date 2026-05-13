/**
 * Flow Builder design tokens.
 * Matches the studio roadmap deck (2026-05-13-jay-studio-roadmap-v2.html).
 * Used by all flow-builder styled components.
 */
export const FLOW = {
  // Backgrounds (darkest → lightest)
  bg: "#0c0c0e",
  bgCard: "#161619",
  bgElevated: "#1e1e22",
  bgInput: "#26262b",

  // Borders
  border: "#2a2a30",
  borderHover: "#3a3a42",

  // Text
  text: "#e8e6e3",
  textDim: "#8a8890",
  textMuted: "#5a5860",

  // Accent (gold)
  accent: "#d4a853",
  accentDim: "rgba(212, 168, 83, 0.15)",
  accentGlow: "rgba(212, 168, 83, 0.08)",

  // Status
  success: "#4ade80",
  processing: "#60a5fa",
  queued: "#6b7280",

  // Radii
  radius: "12px",
  radiusSm: "8px",

  // Typography
  fontFamily: "'DM Sans', sans-serif",
  fontFamilySerif: "'Instrument Serif', serif", // Headers — the "old school Apple" look

  // Animations
  fadeSlideUp: "fadeSlideUp 0.4s ease",
  fadeIn: "fadeIn 0.6s ease both",
} as const;

/**
 * Keyframe animations for flow builder components.
 * Import and inject via createGlobalStyle or use in styled-components.
 */
export const FLOW_KEYFRAMES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
