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
} from "styled-system";
import { Link } from "react-router-dom";

const StyledHeader = styled.header<FlexboxProps & { $isScrolled?: boolean }>`
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  align-items: center;
  width: inherit;
  max-width: 1024px;
  padding: ${(props) => (props.$isScrolled ? "0.5rem 0" : "1rem 0")};
  transition: padding 0.2s ease;

  @media (max-width: ${DEVICES.LAPTOP}) {
    padding: ${(props) => (props.$isScrolled ? "0.5rem 1rem" : "1rem")};
  }

  @media (max-width: ${DEVICES.TABLET}) {
    padding: ${(props) => (props.$isScrolled ? "0.4rem 1rem" : "0.8rem 1rem")};
  }
  ${flexbox}
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  background: ${(props) => props.theme.colorBackgroundTertiary};
  -webkit-backface-visibility: hidden;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const LogoAnchor = styled(Link)`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
`;

export const HeaderTitle = styled.h1<{ $isScrolled?: boolean }>`
  font-family: "Comfortaa", sans-serif;
  font-size: ${(props) => (props.$isScrolled ? "1.6rem" : "2.2rem")};
  color: ${(props) => props.theme.textAccentColor};
  margin: 0.4rem 1rem;
  white-space: nowrap;
  transition: font-size 0.2s ease;

  @media (max-width: ${DEVICES.LAPTOP}) {
    font-size: ${(props) => (props.$isScrolled ? "1.4rem" : "2rem")};
  }

  @media (max-width: ${DEVICES.MOBILE_S}) {
    font-size: ${(props) => (props.$isScrolled ? "1.2rem" : "1.4rem")};
  }
`;

export const LogoProfileWrapper = styled.div<
  OrderProps & FlexboxProps & DisplayProps
>`
  display: flex;
  flex-flow: row;
  align-items: center;
  flex-shrink: 0;
  gap: 0.5rem;

  @media (min-width: ${DEVICES.TABLET}) {
    gap: 1rem;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: nowrap;
  }

  ${order}
  ${flexbox}
  ${display}
`;

export const LogoContainer = styled.div<OrderProps & DisplayProps>`
  display: inline-flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

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
  ${display}
`;

export const LogoIcon = styled.img<{ $isScrolled?: boolean }>`
  width: auto;
  height: ${(props) => (props.$isScrolled ? "2.5rem" : "4rem")};
  max-width: 100%;
  cursor: pointer;
  transition: height 0.2s ease;

  @media (max-width: ${DEVICES.LAPTOP}) {
    height: ${(props) => (props.$isScrolled ? "2rem" : "2.5rem")};
  }

  @media (max-width: ${DEVICES.MOBILE_S}) {
    height: ${(props) => (props.$isScrolled ? "1.5rem" : "1.5rem")};
  }
`;

export const Nav = styled.nav`
  overflow: hidden;
`;

export const NavContainer = styled.div<
  OrderProps & FlexboxProps & DisplayProps
>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${order}
  ${flexbox}
  ${display}
`;

export const ProfileContainer = styled.div<
  OrderProps & SpaceProps & DisplayProps
>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;

  button {
    width: 55px;
    height: 55px;
    font-size: 2rem;
  }
  ${order}
  ${space}
  ${display}
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

  &:not([display="none"])::after {
    content: "•";
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 10px;
  }

  &[data-hide-separator="true"]::after {
    display: none;
  }

  @media (min-width: ${DEVICES.TABLET}) {
    &[data-hide-separator="true"]::after {
      display: inline;
    }
  }

  &:not([display="none"]):last-of-type::after,
  &:not([display="none"]):not(:has(~ li:not([display="none"])))::after {
    display: none;
  }

  @media (max-width: calc(${DEVICES.MOBILE_L} - (0.0625em))) {
    &[display="inline-flex"]:not(:has(~ li[display="inline-flex"]))::after {
      display: none;
    }
  }

  @media (max-width: calc(${DEVICES.TABLET} - (0.0625em))) {
    &[display="none,none,inline-flex,inline-flex"]:not(
        :has(~ li[display="none,none,inline-flex,inline-flex"])
      )::after {
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
  max-width: 4em;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Comfortaa", sans-serif;
  text-transform: lowercase;
  @media (max-width: calc(${DEVICES.MOBILE_L} - (0.0625em))) {
    display: none;
  }
`;

const AvatarStyle = css`
  display: flex;
  align-items: flex-end;
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
  background-size: cover;
  background-position: center;
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
