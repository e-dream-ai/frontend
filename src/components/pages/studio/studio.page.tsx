import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Bugsnag from "@bugsnag/js";
import { useStudioStore } from "@/stores/studio.store";
import { useFlowStore } from "@/stores/flow.store";
import { useUprezStore } from "@/stores/uprez.store";
import { ROUTES } from "@/constants/routes.constants";
import { parseStudioMode, STUDIO_MODE_LABELS } from "./constants/studio-modes";
import { StudioTabs } from "./components/studio-tabs";
import { ProjectBar } from "./components/project-bar";
import { SaveStatus } from "./components/save-status";
import { ProjectConflictModal } from "./components/project-conflict-modal";
import { ProjectLockedModal } from "./components/project-locked-modal";
import { PlaylistActions } from "./components/playlist-actions";
import { StudioSkeleton } from "./components/studio-skeleton";
import { EditLock } from "./components/edit-lock";
import { ViewOnlyMenu } from "./components/view-only-menu";
import { ProjectUnavailable } from "./components/project-unavailable";
import {
  ActionsTab,
  DeforumApp,
  FlowBuilder,
  GenerateTab,
  ImagesTab,
  UprezApp,
} from "./components/lazy-editors";
import { ActionPlaylistSync } from "./components/action-playlist-sync";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
import { useEditorProjectSync } from "./hooks/useEditorProjectSync";
import { useEditorProjectLock } from "./hooks/useEditorProjectLock";
import { useEditorProjectPlaylist } from "./hooks/useEditorProjectPlaylist";
import { useEditorProjectAccess } from "./hooks/useEditorProjectAccess";
import { useRemixEditorProject } from "./hooks/useRemixEditorProject";
import {
  StudioEditLockContext,
  type StudioEditLock,
} from "./hooks/useStudioEditLock";
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
  const access = useEditorProjectAccess(projectUuid);
  const readOnly = access.status === "readOnly";
  const missing = access.status === "missing";
  const isEditable = access.status === "editable";
  const lock = useEditorProjectLock(isEditable ? projectUuid : undefined);
  const sync = useEditorProjectSync(
    mode,
    projectUuid,
    isEditable && (lock.status === "held" || lock.status === "idle"),
  );
  const locked = !sync.canWrite;
  const { remix, isRemixing } = useRemixEditorProject(mode);

  const [viewOnlyOpenFor, setViewOnlyOpenFor] = useState<string>();
  const viewOnlyOpen = readOnly && viewOnlyOpenFor === projectUuid;
  const setViewOnlyOpen = useCallback(
    (open: boolean) => setViewOnlyOpenFor(open ? projectUuid : undefined),
    [projectUuid],
  );
  const editLock = useMemo<StudioEditLock>(
    () => ({
      locked,
      onBlocked: readOnly ? () => setViewOnlyOpen(true) : undefined,
    }),
    [locked, readOnly, setViewOnlyOpen],
  );
  const playlistSave = useEditorProjectPlaylist({
    mode,
    playlist: sync.playlist,
    attachPlaylist: sync.attachPlaylist,
  });
  const isUprez = mode === "uprez";
  const setUprezName = useUprezStore((s) => s.setNameOverride);
  const uprezDraftName = useUprezStore((s) => s.nameOverride);
  const projectName =
    isUprez && !sync.playlist ? uprezDraftName ?? "" : playlistSave.name;
  const displayName = readOnly
    ? projectName || access.project.name
    : projectName;

  const setPlaylistName = playlistSave.setName;
  const handleRename = useCallback(
    (next: string) => {
      if (isUprez && !sync.playlist) {
        setUprezName(next);
        return;
      }
      setPlaylistName(next);
    },
    [isUprez, sync.playlist, setUprezName, setPlaylistName],
  );

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
      // Uprez takes a playlist and deforum takes prompts — neither has
      // anything to drop an image onto.
      if (isUprez || mode === "deforum") return;

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
    [isUprez, mode, addImage, updateImage, addReferenceFrame, uploadDream],
  );

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: handleStudioDrop,
    disabled: locked,
  });

  return (
    <StudioContainer $dragOver={isDragOver} {...dropHandlers}>
      <StudioHeader>
        <BackButton to={ROUTES.STUDIO} title="Back to playlists">
          <ArrowLeft size={16} />
        </BackButton>
        <TitleGroup>
          <LogoLink to={ROUTES.ROOT} aria-label="Go to home">
            <Logo src="/images/edream-logo-512x512.png" alt="e-dream" />
          </LogoLink>
          <StudioTitle>Studio</StudioTitle>
          <EditorBadge $mode={mode}>{STUDIO_MODE_LABELS[mode]}</EditorBadge>
        </TitleGroup>
        {missing ? null : (
          <>
            <ProjectBar
              name={displayName}
              disabled={sync.status === "loading" || !isEditable}
              onRename={handleRename}
              onSubmit={
                isUprez || playlistSave.status === "saving"
                  ? undefined
                  : playlistSave.save
              }
            />
            <PlaylistActions
              playlist={sync.playlist}
              canSave={!isUprez && isEditable}
              saving={playlistSave.status === "saving"}
              onSave={playlistSave.save}
            >
              {readOnly ? (
                <ViewOnlyMenu
                  owner={access.project.owner}
                  open={viewOnlyOpen}
                  onOpenChange={setViewOnlyOpen}
                  remixing={isRemixing}
                  onRemix={() => {
                    setViewOnlyOpen(false);
                    void remix(displayName);
                  }}
                />
              ) : null}
            </PlaylistActions>
          </>
        )}
        <HeaderSpacer />
        {readOnly ? null : <SaveStatus status={sync.status} />}
        {canManageProviderKey ? (
          <CreditsMeter user={currentUser} compact />
        ) : null}
      </StudioHeader>

      <StudioEditLockContext.Provider value={editLock}>
        <StudioBody>
          {missing ? (
            <ProjectUnavailable />
          ) : (
            <Suspense fallback={<StudioSkeleton />}>
              {mode === "flow" && <FlowBuilder />}
              {mode === "action" && (
                <StudioFrame>
                  <StudioTabs />
                  <EditLock>
                    {activeTab === "images" && <ImagesTab />}
                    {activeTab === "actions" && <ActionsTab />}
                  </EditLock>
                  {activeTab === "generate" && <GenerateTab />}
                </StudioFrame>
              )}
              {mode === "deforum" && <DeforumApp />}
              {isUprez && (
                <UprezFrame>
                  <EditLock>
                    <UprezApp
                      playlist={sync.playlist}
                      onCreated={sync.attachPlaylist}
                    />
                  </EditLock>
                </UprezFrame>
              )}
            </Suspense>
          )}

          {sync.status === "loading" ? (
            <BodyOverlay>
              <StudioSkeleton />
            </BodyOverlay>
          ) : null}
        </StudioBody>
      </StudioEditLockContext.Provider>

      <ActionPlaylistSync enabled={mode === "action" && !locked} />

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
