import styled from "styled-components";

export const StyledFooter = styled.footer`
  z-index: 2;
  width: 100%;
  overflow: hidden;
  position: fixed;
  bottom: 0;
  font-size: 1rem;
  color: ${(props) => props.theme.text1};
  padding: 0 15px 15px;
  line-height: 1.4;
  background: ${(props) => props.theme.background4};

  @media only screen and (max-width: 1200px) {
    position: static;
  }

  .reverse {
    color: ${(props) => props.theme.text3};
  }
`;

export const FooterRow = styled.div`
  display: flex;
  flex-flow: row;
`;

export const FooterCol = styled.div<{ flow?: string }>`
  display: flex;
  flex: auto;
  flex-flow: ${(props) => props.flow ?? "row"};
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`;

export default StyledFooter;
