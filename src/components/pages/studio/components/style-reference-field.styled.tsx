import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";
import { PresignedImage } from "@/components/shared/presigned-image/presigned-image";

export const ReferenceField = styled.div`
  margin-top: 16px;
`;

export const ReferencePreview = styled.div`
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  padding: 10px;
  border: 1px solid ${FLOW.border};
  border-radius: 8px;
  background: ${FLOW.bgElevated};

  @media (max-width: 640px) {
    grid-template-columns: 80px minmax(0, 1fr);
  }
`;

export const ReferenceThumbnail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  overflow: hidden;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: 4px;
`;

export const ReferenceImage = styled(PresignedImage)`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const ReferenceName = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 13px;
`;

export const ReferenceActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 640px) {
    grid-column: 1 / -1;
  }
`;
