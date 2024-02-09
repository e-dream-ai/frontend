import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: ${DEVICES.TABLET}) {
    width: 750px;
  }

  @media (min-width: ${DEVICES.LAPTOP}) {
    width: 970px;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem 0;
  background: ${(props) => props.theme.colorBackgroundTertiary};
  -webkit-backface-visibility: hidden;
  z-index: 2;
`;

export const HeaderLogo = styled.a`
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
`;

export const HeaderImage = styled.img`
  width: auto;
  height: 6rem;
  max-width: 100%;
  cursor: pointer;
`;

export const NavHeader = styled.nav`
  overflow: hidden;
  text-align: right;
  white-space: nowrap;
`;

export const HeaderList = styled.ul`
  list-style: none;
`;

export const HeaderListItem = styled.li`
  display: inline-flex;
  font-size: 1.2rem;
  text-transform: uppercase;

  &::after {
    content: "/";
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0 12px;
  }

  &:last-child::after {
    display: none;
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

export default StyledHeader;
