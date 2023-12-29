import styled from "styled-components";

export const StyledInput = styled.input`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  height: 2.2rem;
  padding: 6px 12px;
  background: ${(props) => props.theme.colorBackgroundSecondary};
  border-radius: 0;
  border: 0;
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;

  &:disabled {
    background-color: ${(props) => props.theme.inputBackgroundDisabledColor};
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

export const InputBefore = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  min-width: 40px;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorSecondary};
  text-align: center;
`;

export const InputAfter = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  min-width: 40px;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  text-align: center;
  cursor: pointer;
`;

export const InputError = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colorDanger};
`;

export default StyledInput;
