import { DEVICES } from "@/constants/devices.constants";
import styled, { css } from "styled-components";
import { DeviceType } from "./menu-header";
import { Link } from "react-router-dom";

const StyledHeader = styled.header`
  display: flex;
  flex-flow: row;
  flex: auto;
  flex-wrap: wrap;
  align-items: center;
  width: inherit;
  max-width: 1024px;
  padding: 1rem 0;

  @media (max-width: ${DEVICES.LAPTOP}) {
    padding: 1rem;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    padding: 0.8rem 1rem;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  position: sticky;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100vw;
  background: ${(props) => props.theme.colorBackgroundTertiary};
  -webkit-backface-visibility: hidden;
  z-index: 2;
`;

export const LogoAnchor = styled(Link)`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
`;

export const HeaderTitle = styled.h1`
  font-family: "Comfortaa", sans-serif;
  font-size: 2.2rem;
  color: ${(props) => props.theme.textAccentColor};
  margin: 0.4rem 1rem;
  white-space: nowrap;

  @media (max-width: ${DEVICES.LAPTOP}) {
    font-size: 2rem;
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    font-size: 1.4rem;
  }
`;

export const LogoContainer = styled.div`
  order: 1;
  display: inline-flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  margin-right: 1rem;

  button {
    width: 60px;
    height: 60px;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    margin: 0;

    p,
    button {
      display: block;
    }
  }
`;

export const LogoIcon = styled.img`
  width: auto;
  height: 6rem;
  max-width: 100%;
  cursor: pointer;

  @media (max-width: ${DEVICES.LAPTOP}) {
    height: 3rem;
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    height: 2rem;
  }
`;

export const Nav = styled.nav`
  overflow: hidden;
  @media (max-width: ${DEVICES.TABLET}) {
    /* display: none;
    height: 0; */
    width: 100vw;
    background-color: ${(props) => props.theme.colorBackgroundTertiary};
  }
`;

export const MenuContainer = styled.div`
  order: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;

  @media (max-width: ${DEVICES.TABLET}) {
    order: 4;
  }
`;

export const AuthMenuContainer = styled.div`
  order: 3;
  display: flex;
  flex: auto;
  justify-content: flex-end;
  align-items: center;

  button {
    height: 55px;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    order: 2;
  }
`;

export const MobileMenuContainer = styled.div`
  order: 4;
  display: none;
  justify-content: flex-end;
  align-items: center;
  margin-left: 1rem;
  text-transform: lowercase;

  button {
    width: 55px;
    height: 55px;
    font-size: 2rem;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    order: 3;
    display: flex;
  }
`;

export const StyledNavList = styled.ul`
  display: flex;
  flex-flow: row;
  list-style: none;
  white-space: nowrap;
  padding: 0;
`;

export const NavListItem = styled.li<{
  deviceType?: DeviceType;
  showSlash?: boolean;
}>`
  display: inline-flex;
  font-size: 1.2rem;
  font-family: "Comfortaa", sans-serif;
  text-transform: lowercase;

  &::after {
    content: "•";
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 10px;
  }

  &:last-child::after {
    display: none;
    content: "";
  }

  a {
    color: ${(props) => props.theme.textAccentColor};
  }

  @media (max-width: ${DEVICES.TABLET}) {
    display: ${(props) =>
      props.deviceType === "desktop" ? "none" : " inline-flex"};

    &.both::after {
      content: "•";
    }

    &.both:not(:has(~ .both))::after {
      display: none;
      content: "";
    }
  }
`;

export const HeaderProfileMenu = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${(props) => props.theme.textAccentColor};

  &:hover {
    color: ${(props) => props.theme.colorSecondary};
  }
`;

export const HeaderUserName = styled.span`
  font-family: "Comfortaa", sans-serif;
  text-transform: lowercase;
  @media (max-width: ${DEVICES.TABLET}) {
    display: none;
  }
`;

const AvatarStyle = css`
  display: flex;
  /* Align dot to the bottom */
  align-items: flex-end;
  /* Align dot to the left */
  justify-content: flex-start;

  width: 30px;
  height: 30px;
  border-radius: 100%;
`;

export const HeaderAvatar = styled.div<{
  url?: string;
  socketConnected?: boolean;
  desktopClientConnected?: boolean;
}>`
  ${AvatarStyle}

  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: 0.8rem;
    height: 0.8rem;
    left: 0;
    bottom: 0;
    background-color: ${(props) =>
      props.desktopClientConnected ? "greenyellow" : "gainsboro"};
    border-radius: 50%;
  }

  &::after {
    content: "x";
    display: ${(props) => (props.socketConnected ? "none" : "block")};
    position: absolute;
    transform: translate(0.18rem, 0rem);
    left: 0;
    bottom: 0;
    font-size: 0.8rem;
    font-weight: bold;
    color: red;
  }
`;

export const HeaderAvatarPlaceholder = styled.div`
  display: flex;
  position: relative;
`;

export const HeaderAvatarPlaceholderIcon = styled.div`
  ${AvatarStyle}
  color: ${(props) => props.theme.textBodyColor};
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
`;

export const HeaderAvatarPlaceholderDot = styled.div<{
  desktopClientConnected?: boolean;
}>`
  display: inline-block;
  position: absolute;
  width: 0.8rem;
  height: 0.8rem;
  background-color: ${(props) =>
    props.desktopClientConnected ? "greenyellow" : "gainsboro"};
  border-radius: 50%;
  bottom: 0;
  left: 0;
`;

export const HeaderAvatarPlaceholderX = styled.div<{
  socketConnected?: boolean;
}>`
  content: "x";
  display: ${(props) => (props.socketConnected ? "none" : "block")};
  position: absolute;
  transform: translate(0.18rem, 0rem);
  left: 0;
  bottom: 0;
  font-size: 0.8rem;
  font-weight: bold;
  color: red;
`;

export default StyledHeader;
