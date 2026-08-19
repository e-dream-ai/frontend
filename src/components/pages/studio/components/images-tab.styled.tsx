import styled from "styled-components";
import { PresignedImage } from "@/components/shared/presigned-image";

export const GenerateSection = styled.div`
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.textBodyColor};
  margin-bottom: 1rem;
`;

export const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

export const PromptTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 6px;
  background: ${(props) =>
    props.theme.colorBackgroundSecondary || "transparent"};
  color: ${(props) => props.theme.textPrimaryColor};
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colorPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    resize: none;
  }
`;

export const AdvancedToggle = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textBodyColor};
  font-family: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
  margin: -0.25rem 0 0.75rem;
  text-align: left;

  &:hover {
    color: ${(props) => props.theme.textPrimaryColor};
  }
`;

export const AdvancedFieldLabel = styled.label`
  display: block;
  font-size: 0.8125rem;
  color: ${(props) => props.theme.textBodyColor};
  margin-bottom: 0.4rem;
`;

export const AdvancedFieldHint = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.textBodyColor};
  opacity: 0.75;
  margin: -0.75rem 0 1rem;
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

export const GenerateButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: ${(props) => props.theme.colorPrimary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    filter: brightness(120%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
`;

export const ImageCard = styled.div<{ $selected?: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid
    ${(props) => (props.$selected ? props.theme.colorPrimary : "transparent")};
  cursor: pointer;
  aspect-ratio: 16 / 9;
  background: ${(props) => props.theme.colorBackgroundQuaternary};
`;

export const ImageThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const StarBadge = styled.button<{ $active?: boolean }>`
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${(props) => (props.$active ? "#f5c542" : "#888")};
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

export const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;
  }
`;

export const SelectionCount = styled.span`
  font-size: 0.8125rem;
  color: ${(props) => props.theme.textBodyColor};
`;

export const NavButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: ${(props) => props.theme.colorPrimary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    filter: brightness(120%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryNavButton = styled(NavButton)`
  background: transparent;
  border: 1px solid #555;
`;

export const EmptyStateText = styled.p`
  color: #888;
  font-size: 0.875rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
`;

export const LightboxImage = styled(PresignedImage)`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;

export const ImagesTabContainer = styled.div<{ $dragOver?: boolean }>`
  transition: border-color 0.2s;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 2px;

  ${(props) =>
    props.$dragOver &&
    `
    border-color: ${props.theme.colorPrimary};
  `}
`;

export const LightboxUploadedImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;
