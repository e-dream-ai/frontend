import styled from "styled-components";

export const StyledInput = styled.input`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  height: 2.2rem;
  padding: 6px 12px;
  background: ${(props) => props.theme.background2};
  border-radius: 0;
  border: 0;
  color: ${(props) => props.theme.inputText};
  font-size: 1rem;

  &:disabled {
    background-color: ${(props) => props.theme.disabledInputBackground};
    cursor: not-allowed;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 1rem;
  border-collapse: separate;
`;

export const InputRow = styled.div`
  display: inline-flex;
  border-collapse: separate;
  align-items: center;
`;

export const InputBefore = styled.span`
  height: 2.2rem;
  min-width: 40px;
  padding: 6px 12px;
  background: ${(props) => props.theme.inputBackground};
  color: ${(props) => props.theme.inputText2};
  text-align: center;
`;

export const InputAfter = styled.span`
  height: 2.2rem;
  min-width: 40px;
  padding: 6px 12px;
  background: ${(props) => props.theme.inputBackground};
  color: ${(props) => props.theme.inputText};
  text-align: center;
  cursor: pointer;
`;

export const InputError = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.danger};
`;

export default StyledInput;
