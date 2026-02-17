import styled from "styled-components";

export const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};

  &:last-child {
    border-bottom: none;
  }
`;

export const ActionCheckbox = styled.input.attrs({ type: "checkbox" })`
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  flex-shrink: 0;
`;

export const ActionInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: ${(props) => props.theme.textPrimaryColor};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colorPrimary};
    background: ${(props) =>
      props.theme.colorBackgroundSecondary || "transparent"};
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textBodyColor};
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    color: ${(props) => props.theme.colorDanger || "#e55"};
  }
`;

export const SummaryBox = styled.div`
  border: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: ${(props) => props.theme.textBodyColor};
  margin-top: 1rem;
`;

export const SummaryHighlight = styled.span`
  color: ${(props) => props.theme.textPrimaryColor};
  font-weight: 600;
`;
