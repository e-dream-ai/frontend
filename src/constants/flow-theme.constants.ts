import { keyframes } from "styled-components";

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
  textDim: "#b8b6be",
  textMuted: "#94929a",

  // Accent (gold)
  accent: "#d4a853",
  accentDim: "rgba(212, 168, 83, 0.15)",
  accentGlow: "rgba(212, 168, 83, 0.08)",

  // Status
  success: "#4ade80",
  successDim: "rgba(74, 222, 128, 0.18)",
  processing: "#60a5fa",
  processingDim: "rgba(96, 165, 250, 0.18)",
  queued: "#6b7280",
  error: "#f87171",
  errorDim: "rgba(248, 113, 113, 0.16)",

  // Radii
  radius: "12px",
  radiusSm: "8px",

  // Typography — match the rest of the app
  fontFamily: "'Comfortaa', sans-serif",
  fontFamilySerif: "'Comfortaa', sans-serif",
} as const;

/**
 * Shared keyframe animations for flow builder components.
 */
export const flowFadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const flowSlideIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const flowFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
