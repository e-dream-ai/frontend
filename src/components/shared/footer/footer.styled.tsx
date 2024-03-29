import { DEVICES } from "@/constants/devices.constants";
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

  .reverse {
    color: ${(props) => props.theme.textTertiaryColor};
  }

  @media only screen and (max-width: ${DEVICES.LAPTOP}) {
    position: static;
  }
`;

export const FooterRow = styled.div`
  display: flex;
  flex-flow: row;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-flow: column;
  }
`;

export const FooterCol = styled.div<{ flow?: string }>`
  display: flex;
  flex: auto;
  flex-flow: ${(props) => props.flow ?? "row"};
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;

  @media (max-width: ${DEVICES.TABLET}) {
    font-size: 0.8rem;
  }
`;

export default StyledFooter;
