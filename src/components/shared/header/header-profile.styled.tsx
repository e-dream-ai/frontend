import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const Divider = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.textPrimaryColor};
  padding: 0 1.2rem;

  @media (max-width: ${DEVICES.TABLET}) {
    padding: 0 0.6rem;
  }
`;

export const AnchorIcon = styled.span`
  margin: 0 10px 0 0;
  font-size: 1.2rem;
  color: ${(props) => props.theme.textPrimaryColor};

  @media (max-width: ${DEVICES.TABLET}) {
    display: none;
  }
`;

export const StyledHeaderProfile = styled.div`
  font-family: "Comfortaa", sans-serif;
  text-transform: lowercase;
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  text-wrap: nowrap;
`;

export const DesktopOnlyAuth = styled.div`
  display: inline-flex;
  align-items: center;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    display: none;
  }
`;

export const HelloMessageHeader = styled.span`
  margin-right: 0.2rem;
  color: ${(props) => props.theme.textPrimaryColor};
`;
