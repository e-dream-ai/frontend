import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useEditorProjects } from "@/api/editor-project/query/useEditorProjects";
import { usePrefetchEditorProject } from "@/api/editor-project/query/usePrefetchEditorProject";
import { preloadEditor } from "./components/lazy-editors";
import { NewProjectMenu } from "./components/new-project-menu";
import { ProjectControls } from "./components/project-controls";
import { ProjectThumbnail } from "./components/project-thumbnail";
import { ArchivedProjectDialog } from "./components/archived-project-dialog";
import { useStudioProjectArchive } from "./hooks/useStudioProjectArchive";
import { buildStudioProjectPath, ROUTES } from "@/constants/routes.constants";
import type { StudioMode } from "@/types/flow.types";
import type { EditorProjectSummary } from "@/types/editor-project.types";
import { STUDIO_MODE_LABELS } from "./constants/studio-modes";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ArchiveButton,
  Body,
  Card,
  CardBody,
  CardButton,
  CardLink,
  CardMeta,
  CardMetaRow,
  CardName,
  Container,
  EmptyHint,
  EmptyState,
  EmptyTitle,
  Grid,
  Header,
  Logo,
  LogoLink,
  SkeletonCard,
  SkeletonGrid,
  Title,
  TitleGroup,
} from "./studio-projects.page.styled";

const PROJECTS_PAGE_SIZE = 60;
const SKELETON_COUNT = 6;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const projectName = (project: EditorProjectSummary) =>
  project.playlist?.name ?? project.name;

const emptyHint = (archived: boolean, editorFilter?: StudioMode) => {
  if (archived) {
    return "Playlists you archive from Studio wait here until you bring them back.";
  }
  return editorFilter
    ? `Start a ${STUDIO_MODE_LABELS[editorFilter]} playlist and it will show up here, on every device you sign in from.`
    : "Start a playlist and it will show up here, on every device you sign in from.";
};

export const StudioProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [editorFilter, setEditorFilter] = useState<StudioMode | undefined>();
  const [archived, setArchived] = useState(false);
  const [selected, setSelected] = useState<EditorProjectSummary | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const search = useDebounce(searchDraft.trim(), 400);

  const { data, isLoading, isPreviousData } = useEditorProjects({
    editorId: editorFilter,
    search: search || undefined,
    archived,
    take: PROJECTS_PAGE_SIZE,
  });

  const { prefetch: prefetchProject, cancel: cancelPrefetch } =
    usePrefetchEditorProject();
  const { archive, unarchive } = useStudioProjectArchive();

  const handleIntent = useCallback(
    (project: { uuid: string; editorId: StudioMode }) => {
      preloadEditor(project.editorId);
      prefetchProject(project.uuid);
    },
    [prefetchProject],
  );

  const closeSelected = useCallback(() => setSelected(null), []);

  const projects = data?.data?.projects ?? [];
  const isSwitching = isLoading || isPreviousData;
  const skeletonCount = projects.length > 0 ? projects.length : SKELETON_COUNT;
  const showCreate = !search && !archived;

  return (
    <Container>
      <Header>
        <TitleGroup>
          <LogoLink to={ROUTES.ROOT} aria-label="Go to home">
            <Logo src="/images/edream-logo-512x512.png" alt="e-dream" />
          </LogoLink>
          <Title>Studio</Title>
        </TitleGroup>

        <NewProjectMenu />
      </Header>

      <Body>
        <ProjectControls
          editorFilter={editorFilter}
          onEditorFilterChange={setEditorFilter}
          archived={archived}
          onArchivedChange={setArchived}
          search={searchDraft}
          onSearchChange={setSearchDraft}
        />

        {isSwitching ? (
          <SkeletonGrid aria-hidden="true">
            {Array.from({ length: skeletonCount }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </SkeletonGrid>
        ) : null}

        {!isSwitching && projects.length === 0 ? (
          <EmptyState>
            <EmptyTitle>
              {search
                ? "Nothing found."
                : archived
                  ? "Nothing archived."
                  : "Nothing here yet."}
            </EmptyTitle>
            <EmptyHint>
              {search
                ? "No playlists match that search."
                : emptyHint(archived, editorFilter)}
            </EmptyHint>
            {showCreate ? <NewProjectMenu /> : null}
          </EmptyState>
        ) : null}

        {!isSwitching && projects.length > 0 ? (
          <Grid>
            {projects.map((project) => {
              const name = projectName(project);
              const intent = {
                onMouseEnter: () => handleIntent(project),
                onMouseLeave: cancelPrefetch,
                onFocus: () => handleIntent(project),
                onBlur: cancelPrefetch,
              };
              const content = (
                <>
                  <ProjectThumbnail
                    src={project.thumbnail}
                    alt={`${name} preview`}
                    mode={project.editorId}
                  />
                  <CardBody>
                    <CardName>{name}</CardName>
                    <CardMetaRow>
                      <CardMeta>
                        {archived && project.archivedAt
                          ? `Archived ${formatDate(project.archivedAt)}`
                          : formatDate(project.updated_at)}
                      </CardMeta>
                    </CardMetaRow>
                  </CardBody>
                </>
              );

              return (
                <Card key={project.uuid}>
                  {archived ? (
                    <CardButton
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setSelected(project)}
                      {...intent}
                    >
                      {content}
                    </CardButton>
                  ) : (
                    <>
                      <CardLink
                        to={buildStudioProjectPath(
                          project.editorId,
                          project.uuid,
                        )}
                        {...intent}
                      >
                        {content}
                      </CardLink>
                      <ArchiveButton
                        type="button"
                        aria-label={`Archive ${name}`}
                        title="Archive"
                        onClick={() => archive(project.uuid, name)}
                      >
                        <X size={14} strokeWidth={2.4} />
                      </ArchiveButton>
                    </>
                  )}
                </Card>
              );
            })}
          </Grid>
        ) : null}
      </Body>

      {selected ? (
        <ArchivedProjectDialog
          project={selected}
          name={projectName(selected)}
          onClose={closeSelected}
          onUnarchive={() => {
            unarchive(selected.uuid);
            closeSelected();
          }}
          onUnarchiveAndOpen={() => {
            unarchive(selected.uuid);
            navigate(buildStudioProjectPath(selected.editorId, selected.uuid));
          }}
        />
      ) : null}
    </Container>
  );
};
