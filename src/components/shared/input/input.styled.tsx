import styled from "styled-components";

export const StyledInput = styled.input`
  height: 100%;
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  padding: 0.375rem 0.75rem;
  border: 0;
  border-radius: 0;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }
`;

export const DisabledInput = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  padding: 0.375rem 0.75rem;
  border: 0;
  border-radius: 0;
  align-items: center;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
  cursor: not-allowed;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-flow: column;
  height: 2.375rem;
  min-height: 2.375rem;
  margin-bottom: 1rem;
  border-collapse: separate;
`;

export const InputRow = styled.div`
  display: flex;
  flex: auto;
  border-collapse: separate;
  align-items: center;
`;

export const InputBefore = styled.div`
  display: flex;
  height: 100%;
  min-width: 40px;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorSecondary};
  text-align: center;
`;

export const InputAfter = styled.div`
  display: flex;
  height: 100%;
  min-width: 40px;
  align-items: center;
  justify-content: center;
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
