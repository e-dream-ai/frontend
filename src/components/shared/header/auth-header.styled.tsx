import styled from "styled-components";

export const Divider = styled.div`
  color: ${(props) => props.theme.textPrimaryColor};
  padding: 0 12px;
`;

export const AnchorIcon = styled.span`
  margin: 0 10px 0 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.textPrimaryColor};
`;

export const StyledAuthHeader = styled.div`
  display: inline-flex;
  align-self: flex-end;
`;

export const HelloMessageHeader = styled.span`
  margin-right: 0.2rem;
  color: ${(props) => props.theme.textPrimaryColor};
`;
