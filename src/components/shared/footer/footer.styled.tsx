import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const StyledFooter = styled.footer`
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 2;
  overflow: hidden;
  bottom: 0;
  font-size: 0.875rem;
  color: ${(props) => props.theme.textPrimaryColor};
  padding: 0.875rem;
  line-height: 1.4;
  background: ${(props) => props.theme.colorBackgroundTertiary};

  .reverse {
    color: ${(props) => props.theme.textTertiaryColor};
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
  margin: 0;
  gap: 1rem;

  p {
    margin: 0;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }
`;

export default StyledFooter;
