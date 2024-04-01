import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  flex: 1;
  flex-flow: column;
  justify-content: space-between;
  width: inherit;
  max-width: 1024px;
  padding: 2rem 0;

  @media (max-width: ${DEVICES.LAPTOP}) {
    padding: 2rem;
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
    height: 60px;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    width: -webkit-fill-available;
    width: fill-available;
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

export const NavHeader = styled.nav<{ isNavOpen?: boolean }>`
  overflow: hidden;
  @media (max-width: ${DEVICES.TABLET}) {
    width: 100vw;
    height: ${(props) => (props.isNavOpen ? "100vh" : "0px")};
    background-color: ${(props) => props.theme.colorBackgroundTertiary};
  }
`;

export const TopHeader = styled.div`
  display: inline-flex;
  justify-content: flex-end;

  @media (max-width: ${DEVICES.TABLET}) {
    display: none;
  }
`;

export const BottomHeader = styled.div`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

export const HeaderList = styled.ul`
  display: inline-flex;
  list-style: none;
  white-space: nowrap;
  padding: 0;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-flow: column;
    padding: 1rem 2rem;
  }
`;

export const HeaderListItem = styled.li<{
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
