import styled from "styled-components";

export const CheckboxContainer = styled.label`
  display: inline-block;
  position: relative;
  padding-left: 34px;
  margin-bottom: 24px;
  cursor: pointer;
  font-size: 22px;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /**
   * custom checkbox 
   */
  span {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: ${(props) => props.theme.inputBackgroundEnabledColor};
    border-radius: 5px;
  }

  /**
   * add a background color when the checkbox is checked
   */
  input:checked ~ span {
    background-color: ${(props) => props.theme.colorPrimary};
  }

  /**
   * create the checkmark/indicator, hidden when not checked
   */
  span:after {
    content: "";
    position: absolute;
    display: none;
  }

  /**
   * show the checkmark when checked 
   */
  input:checked ~ span:after {
    display: block;
  }

  span:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
`;

export const StyledCheckbox = styled.input`
  cursor: pointer;
  margin: 0.5rem;
`;

export const CheckboxLabel = styled.span`
  color: ${(props) => props.theme.textSecondaryColor};
`;

export default StyledCheckbox;
