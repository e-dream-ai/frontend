import styled from "styled-components";

export const CheckboxContainer = styled.label`
  display: inline-flex;
  align-items: center;
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    height: 16px;
    width: 16px;
    background-color: ${(props) => props.theme.inputBackgroundEnabledColor};
    border-radius: 3px;
  }

  input:checked ~ span {
    background-color: ${(props) => props.theme.colorPrimary};
  }

  span:after {
    content: "";
    position: absolute;
    display: none;
  }

  input:checked ~ span:after {
    display: block;
  }

  span:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

export const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StyledCheckbox = styled.input`
  cursor: pointer;
`;

export const CheckboxLabel = styled.span`
  font-size: 0.875rem;
  color: ${(props) => props.theme.textSecondaryColor};
`;

export default StyledCheckbox;
