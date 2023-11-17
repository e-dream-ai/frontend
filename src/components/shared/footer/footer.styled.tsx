import { DEVICES } from "constants/devices.constants";
import styled from "styled-components";

export const StyledFooter = styled.footer`
  z-index: 2;
  width: 100%;
  overflow: hidden;
  position: fixed;
  bottom: 0;
  font-size: 1rem;
  color: ${(props) => props.theme.textPrimaryColor};
  padding: 0 15px 15px;
  line-height: 1.4;
  background: ${(props) => props.theme.colorBackgroundTertiary};

  @media only screen and (max-width: ${DEVICES.LAPTOP}) {
    position: static;
  }

  .reverse {
    color: ${(props) => props.theme.textTertiaryColor};
  }
`;

export const FooterRow = styled.div`
  display: flex;
  flex-flow: row;
`;

export const FooterCol = styled.div<{ flow?: string }>`
  display: flex;
  flex: auto;
  flex-flow: ${(props) => props.flow ?? "row"};
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`;

export default StyledFooter;
