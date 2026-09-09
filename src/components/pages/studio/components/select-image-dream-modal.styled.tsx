import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

/** Card styles specific to the image-dream grid. The modal shell lives in
 *  ./select-modal.styled. */

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  /* Cards vary in height now that each takes its image's shape, so don't
     stretch a short one to match the tallest in its row. */
  align-items: start;
`;

export const Card = styled.button<{ $selected: boolean; $disabled?: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  appearance: none;
  /* No fixed aspect-ratio: the image inside sets the height, so the card is
     the image's true shape. The floor only keeps a card that has no image yet
     from collapsing to nothing; it sits below every common ratio at this
     column width. */
  min-height: 60px;
  border-radius: 10px;
  overflow: hidden;
  cursor: ${(p) => (p.$disabled ? "default" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.4 : 1)};
  border: 2px solid ${(p) => (p.$selected ? FLOW.accent : "transparent")};
  transition:
    border-color 0.15s,
    transform 0.12s;
  background: ${FLOW.bgElevated};

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }

  &:hover {
    transform: ${(p) => (p.$disabled ? "none" : "scale(1.03)")};
    border-color: ${(p) => (p.$selected ? FLOW.accent : FLOW.borderHover)};
  }
`;

export const CardImg = styled.img<{ $ratio?: string }>`
  width: 100%;
  /* height follows the intrinsic ratio instead of filling a fixed box, so
     nothing is cropped. */
  height: auto;
  display: block;
  /* When the dream's dimensions are known, reserve the exact box before the
     bitmap arrives so the grid doesn't reflow on load. Same value the intrinsic
     ratio resolves to, so the two agree once it does. Sits on the image rather
     than the card to keep the card's 2px border out of the ratio math. */
  ${(p) => p.$ratio && `aspect-ratio: ${p.$ratio};`}
`;

export const CardCheckmark = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${FLOW.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #000;
  font-weight: 700;
`;

export const CardName = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px 6px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  color: ${FLOW.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
