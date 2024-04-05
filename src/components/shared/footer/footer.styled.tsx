import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const StyledFooter = styled.footer`
  display: flex;
  flex: auto;
  justify-content: center;
  width: 100%;
  z-index: 2;
  overflow: hidden;
  position: fixed;
  bottom: 0;
  font-size: 0.875rem;
  color: ${(props) => props.theme.textPrimaryColor};
  padding: 0.5rem;
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
  flex: auto;
  flex-flow: row;
  max-width: 1024px;
  align-self: center;

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
  margin-bottom: 1rem;
  gap: 1rem;

  p {
    margin: 0;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    font-size: 0.8rem;
  }
`;

export default StyledFooter;
