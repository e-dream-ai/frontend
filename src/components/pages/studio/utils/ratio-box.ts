import { css } from "styled-components";

export const ratioBox = (
  ratio: string | undefined,
  widthCaps: readonly string[],
  maxHeight: string,
) => {
  const r = ratio ?? "16 / 9";
  const caps = [...widthCaps, `calc(${maxHeight} * (${r}))`];
  return css`
    width: min(${caps.join(", ")});
    aspect-ratio: ${r};
  `;
};
