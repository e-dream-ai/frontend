import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const GenerateSection = styled.div`
  padding: 24px ${FLOW.inset};

  & + & {
    border-top: 1px solid ${FLOW.border};
  }
`;

export const SectionTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${FLOW.textMuted};
  font-family: ${FLOW.fontFamily};
  margin-bottom: 20px;
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const FormField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.375rem;
  }
`;

export const FieldLabel = styled.label`
  font-size: 0.8125rem;
  color: ${(props) => props.theme.textBodyColor};
`;

export const StyledSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 6px;
  background: ${(props) =>
    props.theme.colorBackgroundSecondary || "transparent"};
  color: ${(props) => props.theme.textPrimaryColor};
  font-size: 0.8125rem;
  cursor: pointer;
  min-width: 0;
  max-width: 100%;
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
`;

export const ImageCard = styled.div`
  position: relative;
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
  border: 1px solid ${FLOW.border};
  aspect-ratio: 16 / 9;
  background: ${FLOW.bgElevated};
`;

export const ImageThumbnail = styled.img<{ $pending?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props) => (props.$pending ? 0.5 : 1)};
`;

export const ThumbnailButton = styled.button`
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: -2px;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: ${FLOW.textMuted};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${ImageCard}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${FLOW.error};
  }

  /* Touch and keyboard users never get :hover on the card. */
  &:focus-visible {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
`;

export const ImageStatus = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.375rem 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.6875rem;
  text-align: center;
`;

export const SeedLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.6);
  color: #aaa;
  font-size: 0.625rem;
  border-top-right-radius: 4px;
`;

/**
 * Bottom bar of a tab. Sits flush inside StudioFrame, so it carries the same
 * 28px inset as GenerateSection and separates itself with a rule — matching
 * the flow app's ActionBarContainer.
 */
export const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 20px ${FLOW.inset};
  border-top: 1px solid ${FLOW.border};

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 16px ${FLOW.insetNarrow};
  }
`;

export const ImageCount = styled.span`
  font-size: 0.8125rem;
  color: ${(props) => props.theme.textBodyColor};
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${FLOW.accentDim};
  color: ${FLOW.accent};
  border: 1px solid ${FLOW.accent};
  border-radius: ${FLOW.radiusSm};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryNavButton = styled(NavButton)`
  background: ${FLOW.bgElevated};
  color: ${FLOW.textDim};
  border-color: ${FLOW.border};

  &:hover {
    background: ${FLOW.borderHover};
    color: ${FLOW.text};
  }
`;

/**
 * The "+ Upload / + Generate / ..." row. Same treatment as the flow app's
 * AddButton so both studios read as one product.
 */
export const AddButton = styled(SecondaryNavButton)`
  padding: 8px 14px;
  flex-shrink: 0;
`;

export const AddButtonPlus = styled.span`
  font-size: 15px;
  color: ${FLOW.accent};
`;

export const EmptyStateText = styled.p`
  text-align: center;
  padding: 48px 16px;
  color: ${FLOW.textDim};
  font-size: 14px;
`;

export const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ImagesTabContainer = styled.div<{ $dragOver?: boolean }>`
  transition: background-color 0.2s;

  ${(props) =>
    props.$dragOver &&
    `
    background-color: ${FLOW.accentDim};
  `}
`;
