import styled from "styled-components";

export const StyledTextArea = styled.textarea`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  min-height: 8rem;
  overflow-y: hidden;
  resize: none;
  padding: 6px 12px;
  background: ${(props) => props.theme.colorBackgroundSecondary};
  border-radius: 0;
  border: 0;
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
  font-family: inherit;

  &:disabled {
    background-color: ${(props) => props.theme.inputBackgroundColor};
    cursor: not-allowed;
  }
`;

export const DisabledTextArea = styled.div`
  height: 100%;
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  min-height: 8rem;
  padding: 0.375rem 0.75rem;
  border: 0;
  border-radius: 0;
  align-items: center;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
  cursor: not-allowed;
  white-space: pre-wrap;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const TextAreaGroup = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 1rem;
  border-collapse: separate;
`;

export const TextAreaRow = styled.div`
  display: inline-flex;
  border-collapse: separate;
  align-items: center;
`;

export const TextAreaBefore = styled.span`
  min-width: 40px;
  padding: 6px 12px;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorSecondary};
  text-align: center;
  align-self: stretch;
`;

export const TextAreaAfter = styled.span`
  min-width: 40px;
  padding: 6px 12px;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  text-align: center;
  align-self: stretch;
`;

export const TextAreaError = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colorDanger};
`;

export default StyledTextArea;
