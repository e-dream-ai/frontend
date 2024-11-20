import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

export const ProfilePageContainer = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  @media (max-width: ${DEVICES.LAPTOP}) {
    flex-flow: column;
  }
`;