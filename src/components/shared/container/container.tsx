import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100vw;
  padding: 2rem;

  @media (max-width: ${DEVICES.TABLET}) {
    padding: 0.8rem;
  }
`;

const StyledChildren = styled.div`
  display: flex;
  flex-flow: column;
  width: inherit;
  max-width: 1024px;
  background-color: ${(props) => props.theme.colorBackgroundTertiary};

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${(props) => props.theme.textPrimaryColor};
    margin: 0;
    margin-bottom: 1rem;
  }

  form {
    width: auto;
    display: flex;
    flex-flow: column;
  }
`;

export const Container: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <StyledContainer>
    <StyledChildren>{children}</StyledChildren>
  </StyledContainer>
);

export default Container;
