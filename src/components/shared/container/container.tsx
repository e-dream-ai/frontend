import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const Container = styled.div`
  background-color: ${(props) => props.theme.colorBackgroundTertiary};
  padding: 1.875rem;
  margin-right: auto;
  margin-left: auto;

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

  @media (min-width: ${DEVICES.TABLET}) {
    width: 750px;
  }

  @media (min-width: ${DEVICES.LAPTOP}) {
    width: 970px;
  }

  form {
    width: auto;
    display: flex;
    flex-flow: column;
  }
`;

export default Container;
