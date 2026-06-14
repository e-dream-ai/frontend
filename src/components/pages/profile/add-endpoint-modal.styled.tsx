import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const ModalTitle = styled.h3`
  font-size: 1rem;
  color: ${(p) => p.theme.textPrimaryColor};
  margin: 0 0 1.25rem;
`;

export const PresetCard = styled.div<{ $selected?: boolean }>`
  border: 1px solid ${(p) => (p.$selected ? "#c9a227" : "#333")};
  border-radius: 8px;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    border-color: #555;
  }
`;

export const PresetIcon = styled.div<{ $color: string }>`
  width: 2.25rem;
  height: 2.25rem;
  background: ${(p) => p.$color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) => p.theme.textPrimaryColor};
  flex-shrink: 0;
`;

export const PresetInfo = styled.div`
  flex: 1;
`;

export const PresetName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(p) => p.theme.textPrimaryColor};
`;

export const PresetDesc = styled.div`
  font-size: 0.7rem;
  color: ${(p) => p.theme.textSecondaryColor || "#888"};
  margin-top: 0.125rem;
`;

export const PresetCaps = styled.div`
  font-size: 0.7rem;
  color: #4ade80;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: 0.7rem;
  color: ${(p) => p.theme.textSecondaryColor || "#888"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.375rem;
`;

export const FormInput = styled.input`
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: ${(p) => p.theme.textPrimaryColor};
  padding: 0.625rem 0.75rem;
  font-size: 0.8rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #c9a227;
  }

  &::placeholder {
    color: #555;
  }
`;

export const FormHint = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.375rem;

  a {
    color: #c9a227;
    text-decoration: none;
  }
`;

export const FormError = styled.div`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.375rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.625rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
`;

export const ModalButton = styled.button<{
  $accent?: boolean;
  $outline?: boolean;
}>`
  background: ${(p) =>
    p.$accent ? "#c9a227" : p.$outline ? "transparent" : "#1a1a1a"};
  color: ${(p) => (p.$accent ? "#0d0d0d" : p.$outline ? "#aaa" : "#aaa")};
  border: 1px solid ${(p) => (p.$accent ? "#c9a227" : "#333")};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: ${(p) => (p.$accent ? 500 : 400)};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CustomFields = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #2a2a2a;
`;

export const FormSelect = styled.select`
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: ${(p) => p.theme.textPrimaryColor};
  padding: 0.625rem 0.75rem;
  font-size: 0.8rem;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #c9a227;
  }
`;
