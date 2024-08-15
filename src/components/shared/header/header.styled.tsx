import { DEVICES } from "@/constants/devices.constants";
import styled, { css } from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  flex-flow: row;
  flex: auto;
  flex-wrap: wrap;
  justify-content: space-between;
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

export const HeaderContainer = styled.div<{ isNavOpen?: boolean }>`
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

export const LogoAnchor = styled.a`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
`;

export const HeaderTitle = styled.h1`
  font-family: "Comfortaa", sans-serif;
  font-size: 2.2rem;
  color: ${(props) => props.theme.textPrimaryColor};
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
  margin-right: 2rem;

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

export const Nav = styled.nav<{ isNavOpen?: boolean }>`
  overflow: hidden;
  @media (max-width: ${DEVICES.TABLET}) {
    display: ${(props) => (props.isNavOpen ? "flex" : "none")};
    width: 100vw;
    height: ${(props) => (props.isNavOpen ? "100vh" : "0px")};
    background-color: ${(props) => props.theme.colorBackgroundTertiary};
  }
`;

export const MenuContainer = styled.div<{ isNavOpen?: boolean }>`
  order: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${DEVICES.TABLET}) {
    display: ${(props) => (props.isNavOpen ? "flex" : "none")};
    order: 4;
  }
`;

export const AuthMenuContainer = styled.div`
  order: 3;
  display: flex;
  flex: auto;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: ${DEVICES.TABLET}) {
    order: 2;
  }
`;

export const BarsButtonContainer = styled.div`
  order: 4;
  display: none;
  justify-content: flex-end;
  align-items: center;

  button {
    padding: 0 0 0 20px;
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

  @media (max-width: ${DEVICES.TABLET}) {
    flex-flow: column;
    padding: 1rem 2rem;
  }
`;

export const NavListItem = styled.li<{
  onlyMobile?: boolean;
  showSlash?: boolean;
}>`
  display: ${(props) => (props.onlyMobile ? "none" : " inline-flex")};
  font-size: 1.2rem;
  text-transform: uppercase;

  @media (max-width: ${DEVICES.TABLET}) {
    display: inline-flex;
    margin: 0.6rem 0;
  }

  &::after {
    content: ${(props) => (props.showSlash ? `"/"` : "none")};
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 12px;

    @media (max-width: ${DEVICES.TABLET}) {
      content: "";
    }
  }
`;

export const HeaderProfileMenu = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

export const HeaderUserName = styled.span`
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

export const HeaderAvatar = styled.div<{ url?: string; connected?: boolean }>`
  ${AvatarStyle}

  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;

  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: ${(props) =>
      props.connected ? "greenyellow" : "gainsboro"};
    border-radius: 50%;
    vertical-align: middle;
  }
`;

export const HeaderAvatarPlaceholder = styled.div<{
  url?: string;
  connected?: boolean;
}>`
  ${AvatarStyle}

  color: ${(props) => props.theme.textBodyColor};
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;

  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: ${(props) =>
      props.connected ? "greenyellow" : "gainsboro"};
    border-radius: 50%;
    vertical-align: middle;
  }
`;

export default StyledHeader;
