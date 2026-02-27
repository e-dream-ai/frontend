import styled from "styled-components";

export const StudioContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: calc(100vh - 80px);
`;

export const StudioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

export const StudioTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const NewSessionButton = styled.button`
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
`;
