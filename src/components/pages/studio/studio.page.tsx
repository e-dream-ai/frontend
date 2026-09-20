import React, { Suspense, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Bugsnag from "@bugsnag/js";
import { useStudioStore } from "@/stores/studio.store";
import { useFlowStore } from "@/stores/flow.store";
import { ROUTES } from "@/constants/routes.constants";
import { parseStudioMode, STUDIO_MODE_LABELS } from "./constants/studio-modes";
import { StudioTabs } from "./components/studio-tabs";
import { ProjectBar } from "./components/project-bar";
import { SaveStatus } from "./components/save-status";
import { ProjectConflictModal } from "./components/project-conflict-modal";
import { ProjectLockedModal } from "./components/project-locked-modal";
import { PlaylistActions } from "./components/playlist-actions";
import { StudioSkeleton } from "./components/studio-skeleton";
import {
  ActionsTab,
  FlowBuilder,
  GenerateTab,
  ImagesTab,
  ResultsTab,
  UprezApp,
} from "./components/lazy-editors";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
import { useEditorProjectSync } from "./hooks/useEditorProjectSync";
import { useEditorProjectLock } from "./hooks/useEditorProjectLock";
import { useEditorProjectPlaylist } from "./hooks/useEditorProjectPlaylist";
import { useSessionMigration } from "./hooks/useSessionMigration";
import { useFileDropUpload } from "./hooks/useFileDropUpload";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import useAuth from "@/hooks/useAuth";
import usePermission from "@/hooks/usePermission";
import { useUser } from "@/api/user/query/useUser";
import { CreditsMeter } from "@/components/shared/credits-meter/credits-meter";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import {
  StudioContainer,
  StudioHeader,
  StudioTitle,
  TitleGroup,
  Logo,
  LogoLink,
  BackButton,
  HeaderSpacer,
  StudioBody,
  StudioFrame,
  UprezFrame,
  EditorBadge,
  BodyOverlay,
} from "./studio.page.styled";

export const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { editorId, projectUuid } = useParams<{
    editorId?: string;
    projectUuid?: string;
  }>();
  const mode = parseStudioMode(editorId);
  const lock = useEditorProjectLock(projectUuid);
  const sync = useEditorProjectSync(
    mode,
    projectUuid,
    lock.status === "held" || lock.status === "idle",
  );
  const playlistSave = useEditorProjectPlaylist({
    mode,
    playlist: sync.playlist,
    attachPlaylist: sync.attachPlaylist,
  });
  const ownsPlaylist = mode !== "uprez";
  useSessionMigration();

  const activeTab = useStudioStore((s) => s.activeTab);
  useStudioJobProgress();

  const { user: authUser } = useAuth();
  const canManageProviderKey = usePermission({
    permission: PROFILE_PERMISSIONS.CAN_MANAGE_PROVIDER_KEY,
  });
  const { data: userData } = useUser({
    uuid: authUser?.uuid,
    enabled: canManageProviderKey,
  });
  const currentUser = userData?.data?.user;

  const addImage = useStudioStore((s) => s.addImage);
  const updateImage = useStudioStore((s) => s.updateImage);
  const addReferenceFrame = useFlowStore((s) => s.addReferenceFrame);
  const uploadDream = useUploadImageDream();

  const handleStudioDrop = useCallback(
    async (files: File[]) => {
      // The uprez app takes a playlist, not files — nothing to drop onto.
      if (mode === "uprez") return;

      for (const file of files) {
        if (mode === "action") {
          const placeholderUuid = uuidv4();
          const blobUrl = URL.createObjectURL(file);
          addImage({
            uuid: placeholderUuid,
            url: blobUrl,
            name: file.name.replace(/\.[^.]+$/, ""),
            status: "processing",
          });

          try {
            const result = await uploadDream.mutateAsync({ file });
            updateImage(placeholderUuid, {
              uuid: result.dreamUuid,
              url: result.imageUrl,
              status: "processed",
              name: result.name,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateImage(placeholderUuid, { status: "failed" });
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          try {
            const result = await uploadDream.mutateAsync({ file });
            addReferenceFrame({
              id: uuidv4(),
              dreamUuid: result.dreamUuid,
              imageUrl: result.imageUrl,
              name: result.name,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
          }
        }
      }
    },
    [mode, addImage, updateImage, addReferenceFrame, uploadDream],
  );

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: handleStudioDrop,
  });

  return (
    <StudioContainer $dragOver={isDragOver} {...dropHandlers}>
      <StudioHeader>
        <BackButton to={ROUTES.STUDIO} aria-label="Back to playlists">
          <ArrowLeft size={16} />
          <span>Playlists</span>
        </BackButton>
        <TitleGroup>
          <LogoLink to={ROUTES.ROOT} aria-label="Go to home">
            <Logo src="/images/edream-logo-512x512.png" alt="e-dream" />
          </LogoLink>
          <StudioTitle>Studio</StudioTitle>
          <EditorBadge $mode={mode}>{STUDIO_MODE_LABELS[mode]}</EditorBadge>
        </TitleGroup>
        <ProjectBar
          name={playlistSave.name}
          disabled={!ownsPlaylist || sync.status === "loading"}
          onRename={playlistSave.setName}
        />
        <PlaylistActions
          playlist={sync.playlist}
          canSave={ownsPlaylist}
          saving={playlistSave.status === "saving"}
          onSave={playlistSave.save}
        />
        <HeaderSpacer />
        <SaveStatus status={sync.status} />
        {canManageProviderKey ? (
          <CreditsMeter user={currentUser} compact />
        ) : null}
      </StudioHeader>

      <StudioBody>
        <Suspense fallback={<StudioSkeleton />}>
          {mode === "flow" && <FlowBuilder />}
          {mode === "action" && (
            <StudioFrame>
              <StudioTabs />
              {activeTab === "images" && <ImagesTab />}
              {activeTab === "actions" && <ActionsTab />}
              {activeTab === "generate" && <GenerateTab />}
              {activeTab === "results" && <ResultsTab />}
            </StudioFrame>
          )}
          {mode === "uprez" && (
            <UprezFrame>
              <UprezApp onSourcePlaylistChange={sync.attachPlaylist} />
            </UprezFrame>
          )}
        </Suspense>

        {sync.status === "loading" ? (
          <BodyOverlay>
            <StudioSkeleton />
          </BodyOverlay>
        ) : null}
      </StudioBody>

      {lock.status === "blocked" ? (
        <ProjectLockedModal
          lockedAt={lock.lockedAt}
          interrupted={lock.interrupted}
          onTakeOver={lock.takeOver}
          onLeave={() => navigate(ROUTES.STUDIO)}
        />
      ) : null}

      {sync.conflict ? (
        <ProjectConflictModal
          serverName={sync.conflict.name}
          onTakeTheirs={sync.takeServerVersion}
          onOverwrite={sync.overwriteServerVersion}
          onKeepMine={sync.keepMineAsNewProject}
        />
      ) : null}
    </StudioContainer>
  );
};
