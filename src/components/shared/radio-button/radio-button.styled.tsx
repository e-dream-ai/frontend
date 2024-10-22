import styled from "styled-components";

export const RadioButtonInput = styled.input`
  display: none;
`;

export const RadioButtonLabel = styled.label`
  cursor: inherit;
`;

export const StyledRadioButton = styled.div<{ checked?: boolean }>`
  display: inline-flex;
  width: fit-content;
  padding: 0.4rem 0.8rem;
  margin-right: 0.2rem;
  margin-bottom: 0.6rem;
  border-radius: 15px;
  color: ${(props) =>
    props.checked ? props.theme.textPrimaryColor : props.theme.textBodyColor};
  background-color: ${(props) =>
    props.checked
      ? props.theme.colorPrimary
      : props.theme.colorBackgroundQuaternary};
  cursor: pointer;
  -webkit-transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;
  transition:
    color linear 0.4s,
    background-color linear 0.4s,
    border-color linear 0.4s;

  :hover {
    background-color: ${(props) =>
      props.checked
        ? props.theme.colorPrimary
        : props.theme.colorBackgroundSecondary};
  }
`;
