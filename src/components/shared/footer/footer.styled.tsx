import styled from "styled-components";

export const StyledFooter = styled.footer`
  z-index: 2;
  width: 100%;
  overflow: hidden;
  position: fixed;
  bottom: 0;
  font-size: 1rem;
  color: #999;
  padding: 0 15px 15px;
  line-height: 1.4;
  background: rgba(255, 255, 255, 0.02);

  @media only screen and (max-width: 1200px) {
    position: static;
  }

  .reverse {
    color: #000;
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
