import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const RemoteControlContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 70px);
  grid-auto-rows: auto;
  justify-content: center;
  align-items: center;
  gap: 0.8em;

  /* Responsive layout for smaller screens */
  @media (max-width: ${DEVICES.TABLET}) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-direction: column;

    button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;

export const RemoteControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3em;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    flex-direction: column;
    gap: 0.5em;
  }
`;

export const ControlContainer = styled.div`
  display: flex;
  gap: 0.3em;
  flex-wrap: wrap;
`;

export const IconButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease-in-out;
  color: rgb(252, 217, 183);

  :hover {
    color: rgb(0, 208, 219);
  }
`;

export const IconRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
`;

export const IconGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;
