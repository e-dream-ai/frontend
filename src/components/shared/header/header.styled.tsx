import { DEVICES } from "@/constants/devices.constants";
import styled, { css } from "styled-components";
import {
  display,
  DisplayProps,
  order,
  OrderProps,
  flexbox,
  FlexboxProps,
  SpaceProps,
  space,
} from "styled-system"
import { Link } from "react-router-dom";

const StyledHeader = styled.header<FlexboxProps>`
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
  ${flexbox}
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

export const LogoContainer = styled.div<OrderProps>`
  display: inline-flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

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

  ${order}
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
    width: 100vw;
    background-color: ${(props) => props.theme.colorBackgroundTertiary};
  }
`;

export const NavContainer = styled.div<OrderProps & FlexboxProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${order}
  ${flexbox}
`;

export const ProfileContainer = styled.div<OrderProps & SpaceProps>`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  button {
    width: 55px;
    height: 55px;
    font-size: 2rem;
  }
  ${order}
  ${space}
`;

export const StyledNavList = styled.ul`
  display: flex;
  flex-flow: row;
  list-style: none;
  white-space: nowrap;
  padding: 0;
`;

export const NavListItem = styled.li<DisplayProps>`
  font-size: 1.2rem;
  font-family: "Comfortaa", sans-serif;
  text-transform: lowercase;

  a {
    color: ${(props) => props.theme.textAccentColor};
  }

  // adding dot • menu separator
  &:not([display="none"])::after {
    content: "•";
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 10px;
  }

  // remove dot • menu separator from last child
  &:not([display="none"]):last-of-type::after,
  &:not([display="none"]):not(:has(~ li:not([display="none"])))::after {
    display: none;
  }

  // remove dot • menu separator from last child on tablets or lower
  @media (max-width: 831px) {
    &[display="inline-flex"]:not(:has(~ li[display="inline-flex"]))::after {
      display: none;
    }
  }
  
  // remove dot • menu separator from last child on tablets or lower
  @media (max-width: 1023px) {
    &[display="none,none,inline-flex,inline-flex"]:not(:has(~ li[display="none,none,inline-flex,inline-flex"]))::after {
      display: none;
    }
  }

  ${display}
`;

export const HeaderProfileWrapper = styled.div`
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
  @media (max-width: 639px) {
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

export const HeaderAvatarWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
`;

export const HeaderAvatar = styled.div<{
  url?: string;
}>`
  ${AvatarStyle}
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
  position: relative;
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

export const StyledStatusDot = styled.div<{
  desktopClientConnected?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0.8rem;
  height: 0.8rem;
  background-color: ${(props) =>
    props.desktopClientConnected ? "greenyellow" : "gainsboro"};
  border-radius: 50%;
`;

export const StyledSocketStatus = styled.div<{
  socketConnected?: boolean;
}>`
  display: ${(props) => (props.socketConnected ? "none" : "block")};
  font-size: 0.8rem;
  color: red;
`;

export default StyledHeader;
