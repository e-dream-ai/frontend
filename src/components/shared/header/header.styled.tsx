import styled from "styled-components";

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  padding: 1rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  -webkit-backface-visibility: hidden;
  margin-right: auto;
  margin-left: auto;
`;

export const HeaderLogo = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const HeaderTitle = styled.h1`
  color: #fff;
  margin-left: 0.5rem;
`;

export const HeaderImage = styled.img`
  float: left;
  margin: 9px 0 0 0;
  width: auto;
  height: 5rem;
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
  font-family: "Lato", sans-serif;
  text-transform: uppercase;

  &::after {
    content: "/";
    color: #fff;
    margin: 0 12px;
  }

  &:last-child::after {
    display: none;
  }
`;

export default StyledHeader;
