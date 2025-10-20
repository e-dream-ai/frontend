import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const RemoteControlContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 2em;
  width: 100%;

  /* Responsive layout for smaller screens */
  @media (max-width: ${DEVICES.TABLET}) {
    button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.3em;

  button {
    width: 100%;
  }

  &.row-3 {
    padding-left: 16%;
    padding-right: 7%;
  }
`;

export const RemoteControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5em;
  width: 100%;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    gap: 0.5em;
    justify-content: space-between;
  }
`;

export const ControlContainer = styled.div`
  gap: 0.3em;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  width: 100%;
  max-width: 80%;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-direction: row;
    max-width: 100%;
  }
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
  min-width: fit-content !important;
  min-height: fit-content !important;

  :hover {
    color: rgb(0, 208, 219);
  }
`;

export const IconRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    gap: 0.5em;
  }
`;

export const IconGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

export const TopControls = styled.div`
  display: flex;
  gap: 0.3em;
  padding-left: 7%;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.3em;
`;
