import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const ProfilePageContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  @media (max-width: ${DEVICES.LAPTOP}) {
    flex-flow: column;
  }
`;

export const LeftProfilePage = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  padding: 0 4rem;
  @media (max-width: ${DEVICES.LAPTOP}) {
    flex: auto;
  }
`;

export const RightProfilePage = styled.div`
  display: flex;
  flex-flow: column;
  flex: 2;
  @media (max-width: ${DEVICES.LAPTOP}) {
    flex: auto;
  }
`;
