import styled from "styled-components";

export const SectionContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #2a2a2a;
  border-radius: 12px;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) => p.theme.textPrimaryColor};
  margin: 0;
`;

export const SectionSubtitle = styled.p`
  font-size: 0.75rem;
  color: ${(p) => p.theme.textSecondaryColor || "#888"};
  margin: 0.25rem 0 0;
`;

export const AddButton = styled.button`
  background: ${(p) => p.theme.textAccentColor || "#c9a227"};
  color: #0d0d0d;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export const EmptyState = styled.div`
  border: 1px dashed #333;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: ${(p) => p.theme.textSecondaryColor || "#666"};
  font-size: 0.85rem;
`;

export const EndpointCard = styled.div`
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const EndpointInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ProviderIcon = styled.div<{ $color: string }>`
  width: 2rem;
  height: 2rem;
  background: ${(p) => p.$color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(p) => p.theme.textPrimaryColor};
`;

export const EndpointName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(p) => p.theme.textPrimaryColor};
`;

export const EndpointMeta = styled.div`
  font-size: 0.7rem;
  color: ${(p) => p.theme.textSecondaryColor || "#888"};
  margin-top: 0.125rem;
`;

export const StatusDot = styled.span<{ $color: string }>`
  color: ${(p) => p.$color};
`;

export const EndpointActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionBtn = styled.button<{ $danger?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 6px;
  color: ${(p) => (p.$danger ? "#ef4444" : p.theme.textSecondaryColor || "#aaa")};
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
