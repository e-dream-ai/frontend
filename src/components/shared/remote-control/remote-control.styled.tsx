import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const RemoteControlContainer = styled.div`
  display: grid;
  grid-template-rows: repeat(6, auto);
  grid-template-columns: repeat(11, 60px);
  gap: 0.2rem;

  @media (max-width: ${DEVICES.TABLET}) {
    display: flex;
    flex-wrap: wrap;

    p {
      display: none;
    }

    button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;
