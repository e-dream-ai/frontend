import React, { useCallback, useState } from "react";
import { Film } from "lucide-react";
import { useEditorProjects } from "@/api/editor-project/query/useEditorProjects";
import { usePrefetchEditorProject } from "@/api/editor-project/query/usePrefetchEditorProject";
import { preloadEditor } from "./components/lazy-editors";
import { NewProjectMenu } from "./components/new-project-menu";
import { ProjectControls } from "./components/project-controls";
import { buildStudioProjectPath, ROUTES } from "@/constants/routes.constants";
import type { StudioMode } from "@/types/flow.types";
import { STUDIO_MODE_LABELS } from "./constants/studio-modes";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Body,
  Card,
  CardBody,
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
  Thumb,
  ThumbBadge,
  ThumbFallback,
  Title,
  TitleGroup,
} from "./studio-projects.page.styled";

const PROJECTS_PAGE_SIZE = 60;
const UNSAVED_PLAYLIST_NAME = "Untitled";
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
  const [editorFilter, setEditorFilter] = useState<StudioMode | undefined>();
  const [searchDraft, setSearchDraft] = useState("");
  const search = useDebounce(searchDraft.trim(), 400);

  const { data, isLoading, isPreviousData } = useEditorProjects({
    editorId: editorFilter,
    search: search || undefined,
    take: PROJECTS_PAGE_SIZE,
  });

  const { prefetch: prefetchProject, cancel: cancelPrefetch } =
    usePrefetchEditorProject();

  const handleIntent = useCallback(
    (project: { uuid: string; editorId: StudioMode }) => {
      preloadEditor(project.editorId);
      prefetchProject(project.uuid);
    },
    [prefetchProject],
  );
  const projects = data?.data?.projects ?? [];
  const isSwitching = isLoading || isPreviousData;
  const skeletonCount = projects.length > 0 ? projects.length : SKELETON_COUNT;
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
              {search ? "Nothing found." : "Nothing here yet."}
            </EmptyTitle>
            <EmptyHint>
              {search
                ? "No playlists match that search."
                : editorFilter
                  ? `Start a ${STUDIO_MODE_LABELS[editorFilter]} playlist and it will show up here, on every device you sign in from.`
                  : "Start a playlist and it will show up here, on every device you sign in from."}
            </EmptyHint>
            {search ? null : <NewProjectMenu />}
          </EmptyState>
        ) : null}

        {!isSwitching && projects.length > 0 ? (
          <Grid>
            {projects.map((project) => {
              const mode = project.editorId;
              const name = project.playlist?.name ?? UNSAVED_PLAYLIST_NAME;

              return (
                <Card key={project.uuid}>
                  <CardLink
                    to={buildStudioProjectPath(project.editorId, project.uuid)}
                    onMouseEnter={() => handleIntent(project)}
                    onMouseLeave={cancelPrefetch}
                    onFocus={() => handleIntent(project)}
                    onBlur={cancelPrefetch}
                  >
                    <Thumbnail
                      src={project.thumbnail}
                      alt={`${name} preview`}
                      mode={mode}
                      label={STUDIO_MODE_LABELS[mode] ?? project.editorId}
                    />
                    <CardBody>
                      <CardName>{name}</CardName>
                      <CardMetaRow>
                        <CardMeta>{formatUpdated(project.updated_at)}</CardMeta>
                      </CardMetaRow>
                    </CardBody>
                  </CardLink>
                </Card>
              );
            })}
          </Grid>
        ) : null}
      </Body>
    </Container>
  );
};
