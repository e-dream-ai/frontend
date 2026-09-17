import React, { useCallback, useState } from "react";
import { Film, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { toast } from "react-toastify";
import Bugsnag from "@bugsnag/js";
import { useEditorProjects } from "@/api/editor-project/query/useEditorProjects";
import { useDeleteEditorProject } from "@/api/editor-project/mutation/useDeleteEditorProject";
import { useSessionMigration } from "./hooks/useSessionMigration";
import {
  buildStudioEditorPath,
  buildStudioProjectPath,
  ROUTES,
} from "@/constants/routes.constants";
import type { StudioMode } from "@/types/flow.types";
import {
  DEFAULT_STUDIO_MODE,
  STUDIO_MODE_LABELS,
  STUDIO_MODES,
} from "./constants/studio-modes";
import {
  Body,
  Card,
  CardBody,
  CardLink,
  CardMeta,
  CardMetaRow,
  CardName,
  Container,
  DeleteButton,
  EmptyHint,
  EmptyState,
  EmptyTitle,
  FilterButton,
  FilterToggle,
  Grid,
  Header,
  HeaderSpacer,
  Logo,
  LogoLink,
  NewButton,
  SectionLabel,
  SkeletonCard,
  SkeletonGrid,
  Thumb,
  ThumbBadge,
  ThumbFallback,
  Title,
  TitleGroup,
} from "./studio-projects.page.styled";

const PROJECTS_PAGE_SIZE = 60;
const SKELETON_COUNT = 6;

type ThumbnailProps = {
  src?: string | null;
  alt: string;
  mode: StudioMode;
  label: string;
};

const Thumbnail: React.FC<ThumbnailProps> = ({ src, alt, mode, label }) => (
  <Thumb>
    {src ? (
      <img src={src} alt={alt} loading="lazy" />
    ) : (
      <ThumbFallback>
        <Film size={20} />
      </ThumbFallback>
    )}
    <ThumbBadge $mode={mode}>{label}</ThumbBadge>
  </Thumb>
);

const formatUpdated = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const StudioProjectsPage: React.FC = () => {
  useSessionMigration();
  const [editorFilter, setEditorFilter] = useState<StudioMode | undefined>();

  const { data, isLoading, isPreviousData } = useEditorProjects({
    editorId: editorFilter,
    take: PROJECTS_PAGE_SIZE,
  });

  const deleteProject = useDeleteEditorProject();
  const projects = data?.data?.projects ?? [];
  const isSwitching = isLoading || isPreviousData;
  const skeletonCount = projects.length > 0 ? projects.length : SKELETON_COUNT;
  const newProjectMode = editorFilter ?? DEFAULT_STUDIO_MODE;
  const [pendingDelete, setPendingDelete] = useState<{
    uuid: string;
    name: string;
  } | null>(null);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const { uuid, name } = pendingDelete;

    try {
      await deleteProject.mutateAsync(uuid);
      setPendingDelete(null);
      toast.success(`Deleted ${name}`);
    } catch (error) {
      Bugsnag.notify(error as Error);
      toast.error("Could not delete that project. Try again.");
    }
  }, [deleteProject, pendingDelete]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <LogoLink to={ROUTES.ROOT} aria-label="Go to home">
            <Logo src="/images/edream-logo-512x512.png" alt="e-dream" />
          </LogoLink>
          <Title>Studio</Title>
        </TitleGroup>

        <FilterToggle role="group" aria-label="Filter projects by editor">
          <FilterButton
            type="button"
            $active={editorFilter === undefined}
            aria-pressed={editorFilter === undefined}
            onClick={() => setEditorFilter(undefined)}
          >
            All
          </FilterButton>
          {STUDIO_MODES.map((mode) => (
            <FilterButton
              key={mode}
              type="button"
              $active={editorFilter === mode}
              aria-pressed={editorFilter === mode}
              onClick={() => setEditorFilter(mode)}
            >
              {STUDIO_MODE_LABELS[mode]}
            </FilterButton>
          ))}
        </FilterToggle>

        <HeaderSpacer />

        <NewButton to={buildStudioEditorPath(newProjectMode)}>
          <Plus size={14} strokeWidth={2.4} />
          New {STUDIO_MODE_LABELS[newProjectMode]}
        </NewButton>
      </Header>

      <Body>
        <SectionLabel>
          {editorFilter
            ? `${STUDIO_MODE_LABELS[editorFilter]} projects`
            : "All projects"}
        </SectionLabel>

        {isSwitching ? (
          <SkeletonGrid aria-hidden="true">
            {Array.from({ length: skeletonCount }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </SkeletonGrid>
        ) : null}

        {!isSwitching && projects.length === 0 ? (
          <EmptyState>
            <EmptyTitle>Nothing here yet.</EmptyTitle>
            <EmptyHint>
              Start a {STUDIO_MODE_LABELS[newProjectMode]} project and it will
              show up here, on every device you sign in from.
            </EmptyHint>
            <NewButton to={buildStudioEditorPath(newProjectMode)}>
              <Plus size={14} strokeWidth={2.4} />
              New {STUDIO_MODE_LABELS[newProjectMode]}
            </NewButton>
          </EmptyState>
        ) : null}

        {!isSwitching && projects.length > 0 ? (
          <Grid>
            {projects.map((project) => {
              const mode = project.editorId;

              return (
                <Card key={project.uuid}>
                  <CardLink
                    to={buildStudioProjectPath(project.editorId, project.uuid)}
                  >
                    <Thumbnail
                      src={project.thumbnail}
                      alt={`${project.name} preview`}
                      mode={mode}
                      label={STUDIO_MODE_LABELS[mode] ?? project.editorId}
                    />
                    <CardBody>
                      <CardName>{project.name}</CardName>
                      <CardMetaRow>
                        <CardMeta>{formatUpdated(project.updated_at)}</CardMeta>
                      </CardMetaRow>
                    </CardBody>
                  </CardLink>

                  <DeleteButton
                    type="button"
                    aria-label={`Delete ${project.name}`}
                    onClick={() =>
                      setPendingDelete({
                        uuid: project.uuid,
                        name: project.name,
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </DeleteButton>
                </Card>
              );
            })}
          </Grid>
        ) : null}
      </Body>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        isConfirming={deleteProject.isLoading}
        title="Delete project"
        text={`"${
          pendingDelete?.name ?? ""
        }" and its saved state will be removed. The dreams and playlists it produced are not affected.`}
        confirmText="Delete"
        confirmButtonType="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Container>
  );
};
