import React from "react";
import type { EditorProjectSummary } from "@/types/editor-project.types";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { STUDIO_MODE_LABELS } from "../constants/studio-modes";
import { ProjectThumbnail } from "./project-thumbnail";
import {
  AddBtn,
  CancelBtn,
  CloseBtn,
  Footer,
  FooterButtons,
  Header,
  Overlay,
  Title,
} from "./select-modal.styled";
import {
  ArchivedBody,
  ArchivedInfo,
  ArchivedName,
  ArchivedPanel,
  ArchivedPreview,
} from "./archived-project-dialog.styled";

type Props = {
  project: EditorProjectSummary;
  name: string;
  onUnarchive: () => void;
  onUnarchiveAndOpen: () => void;
  onClose: () => void;
};

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

export const ArchivedProjectDialog: React.FC<Props> = ({
  project,
  name,
  onUnarchive,
  onUnarchiveAndOpen,
  onClose,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  return (
    <Overlay ref={overlayRef} tabIndex={-1} onClick={onClose}>
      <ArchivedPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="archived-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Header>
          <Title>Archived playlist</Title>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>
        <ArchivedBody>
          <ArchivedPreview>
            <ProjectThumbnail
              src={project.thumbnail}
              alt={`${name} preview`}
              mode={project.editorId}
            />
          </ArchivedPreview>
          <ArchivedName id="archived-project-title">{name}</ArchivedName>
          <ArchivedInfo>
            <dt>Editor</dt>
            <dd>{STUDIO_MODE_LABELS[project.editorId] ?? project.editorId}</dd>
            <dt>Archived</dt>
            <dd>{formatDateTime(project.archivedAt)}</dd>
            <dt>Last edited</dt>
            <dd>{formatDateTime(project.updated_at)}</dd>
            <dt>Created</dt>
            <dd>{formatDateTime(project.created_at)}</dd>
          </ArchivedInfo>
        </ArchivedBody>
        <Footer>
          <span />
          <FooterButtons>
            <CancelBtn type="button" onClick={onUnarchive}>
              Unarchive
            </CancelBtn>
            <AddBtn type="button" data-autofocus onClick={onUnarchiveAndOpen}>
              Unarchive and open
            </AddBtn>
          </FooterButtons>
        </Footer>
      </ArchivedPanel>
    </Overlay>
  );
};
