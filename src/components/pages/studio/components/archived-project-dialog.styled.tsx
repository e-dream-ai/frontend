import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { Panel, Body } from "./select-modal.styled";

export const ArchivedPanel = styled(Panel)`
  max-width: 560px;
  max-height: 92vh;
`;

export const ArchivedBody = styled(Body)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ArchivedPreview = styled.div`
  border-radius: ${FLOW.radiusSm};
  overflow: hidden;
`;

export const ArchivedName = styled.h4`
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${FLOW.text};
  overflow-wrap: anywhere;
`;

export const ArchivedInfo = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 0;
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
  line-height: 1.45;

  dt {
    color: ${FLOW.textMuted};
  }

  dd {
    margin: 0;
    color: ${FLOW.text};
  }
`;
