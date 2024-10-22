import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const StyledContainer = styled.div`
  display: flex;
  flex: auto;
  justify-content: center;
  width: 100vw;
  padding: 1rem;

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
    font-family: "Comfortaa", sans-serif;
    text-transform: lowercase;
    font-size: 1.6rem;
    font-weight: 700;
    color: ${(props) => props.theme.textAccentColor};
    margin: 0;
    margin-bottom: 1rem;
  }

  h3 {
    font-family: "Comfortaa", sans-serif;
    text-transform: lowercase;
    font-size: 1rem;
    font-weight: 700;
    color: ${(props) => props.theme.textAccentColor};
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
