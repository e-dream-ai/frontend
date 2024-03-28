import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  flex-flow: column;
  align-items: center;
  width: inherit;
  max-width: 1024px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding: 2rem;
  background: ${(props) => props.theme.colorBackgroundTertiary};
  -webkit-backface-visibility: hidden;
  z-index: 2;

  @media (max-width: ${DEVICES.TABLET}) {
    padding: 1rem;
  }
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
  margin-left: 0.5rem;
  white-space: nowrap;

  @media (max-width: ${DEVICES.LAPTOP}) {
    font-size: 2rem;
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    font-size: 1.6rem;
  }
`;

export const LogoContainer = styled.div`
  display: inline-flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

  p,
  button {
    display: none;
  }

  button {
    width: 60px;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    width: inherit;
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
    height: 4rem;
  }

  @media (max-width: ${DEVICES.MOBILE_L}) {
    height: 3rem;
  }
`;

export const NavHeader = styled.nav<{ isOpen?: boolean }>`
  overflow: hidden;
  transition: height 0.3s ease-out;
  @media (max-width: ${DEVICES.TABLET}) {
    width: 100vw;
    height: ${(props) => (props.isOpen ? "100vh" : "0px")};
    background-color: ${(props) => props.theme.colorBackgroundTertiary};
  }
`;

export const TopHeader = styled.div`
  display: inline-flex;
  width: -webkit-fill-available;
  justify-content: flex-end;

  @media (max-width: ${DEVICES.TABLET}) {
    display: none;
  }
`;

export const BottomHeader = styled.div`
  width: -webkit-fill-available;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-flow: column;
  }
`;

export const HeaderList = styled.ul`
  display: inline-flex;
  list-style: none;
  white-space: nowrap;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-flow: column;
  }
`;

export const HeaderListItem = styled.li<{ onlyMobile?: boolean }>`
  display: ${(props) => (props.onlyMobile ? "none" : " inline-flex")};
  font-size: 1.2rem;
  text-transform: uppercase;

  &::after {
    content: "/";
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 12px;

    @media (max-width: ${DEVICES.TABLET}) {
      content: "";
    }
  }

  &:last-child::after {
    display: none;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    display: inline-flex;
    margin: 0.6rem 0;
  }
`;

export const HeaderProfileMenu = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

export const HeaderAvatar = styled.div<{ url?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 100%;
  background-color: rgba(30, 30, 30, 1);
  background-image: ${(props) => `url(${props?.url})`};
  background-size: contain;
`;

export const HeaderAvatarPlaceholder = styled.div<{ url?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 100%;
  color: ${(props) => props.theme.textBodyColor};
  background-color: rgba(30, 30, 30, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
`;

export default StyledHeader;
