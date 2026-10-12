import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { useQueryClient } from "@tanstack/react-query";
import {
  NO_OP_HINT,
  type UpscaleFactor,
} from "../constants/enhance-factor-options";
import type { PlaylistSummary } from "../hooks/useUserPlaylists";
import { useEnhanceStore } from "@/stores/enhance.store";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import {
  PLAYLIST_QUERY_KEY,
  playlistQueryOptions,
  usePlaylist,
} from "@/api/playlist/query/usePlaylist";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import {
  ENHANCE_RUN_PREVIEW_QUERY_KEY,
  useEnhanceRunPreview,
} from "@/api/playlist/query/useEnhanceRunPreview";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import { PlaylistProgress } from "@/components/shared/dream-progress/playlist-progress";
import {
  describePlaylistContents,
  usePlaylistMetadata,
} from "../hooks/usePlaylistMetadata";
import { useCreateEnhancePlaylist } from "../hooks/useCreateEnhancePlaylist";
import { SelectPlaylistModal } from "./select-playlist-modal";
import { EnhanceFactorFields } from "./enhance-factor-row";
import { EnhancePlaylistCard } from "./enhance-playlist-card";
import {
  buildEnhancePlaylistPrompt,
  isNoOpEnhance,
} from "../utils/enhance-playlist-prompt";
import {
  defaultUpscaleFactor,
  describeEnhanceResult,
} from "../utils/enhance-media";
import { formatEnhanceRunSummary } from "@/utils/enhance-run-summary";
import { useStudioEditLock } from "../hooks/useStudioEditLock";
import {
  AppBody,
  AppHeader,
  AppTitle,
  EmptySource,
  FactorFields,
  Footer,
  Hint,
  Intro,
  LinkButton,
  PrimaryButton,
  ProgressPanel,
  Section,
  SectionLabel,
  SpinningIcon,
  TitleRow,
} from "./enhance-app.styled";

type Props = {
  playlist: EditorProjectPlaylistRef | null;
  onCreated?: (playlist: EditorProjectPlaylistRef) => Promise<boolean>;
};

export const EnhanceApp: React.FC<Props> = ({ playlist, onCreated }) => {
  const { t } = useTranslation();
  const { locked } = useStudioEditLock();
  const queryClient = useQueryClient();
  const createEnhancePlaylist = useCreateEnhancePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const runPlaylist = useRunPlaylist();

  const selected = useEnhanceStore((s) => s.sourcePlaylist);
  const nameOverride = useEnhanceStore((s) => s.nameOverride);
  const upscaleFactor = useEnhanceStore((s) => s.upscaleFactor);
  const interpolationFactor = useEnhanceStore((s) => s.interpolationFactor);
  const setSourcePlaylist = useEnhanceStore((s) => s.setSourcePlaylist);
  const setUpscaleFactor = useEnhanceStore((s) => s.setUpscaleFactor);
  const setInterpolationFactor = useEnhanceStore(
    (s) => s.setInterpolationFactor,
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const pendingUpscaleDefault = useRef<string | null>(null);

  const selectedUuid = selected?.uuid ?? "";
  const { playlist: source, meta: sourceMeta } =
    usePlaylistMetadata(selectedUuid);
  const sourceMedia = source?.media;

  const applyUpscaleDefault = async (uuid: string) => {
    pendingUpscaleDefault.current = uuid;
    const response = await queryClient
      .ensureQueryData(playlistQueryOptions(uuid))
      .catch(() => undefined);
    if (pendingUpscaleDefault.current !== uuid) return;
    pendingUpscaleDefault.current = null;

    const current = useEnhanceStore.getState();
    if (
      !response ||
      current.sourcePlaylist?.uuid !== uuid ||
      current.interpolationFactor === 1
    ) {
      return;
    }
    setUpscaleFactor(defaultUpscaleFactor(response.data?.playlist?.media));
  };

  const handleSelectSource = (picked: PlaylistSummary) => {
    const changed = picked.uuid !== selected?.uuid;
    setSourcePlaylist(picked);
    if (changed) void applyUpscaleDefault(picked.uuid);
  };

  const handleUpscaleChange = (factor: UpscaleFactor) => {
    pendingUpscaleDefault.current = null;
    setUpscaleFactor(factor);
  };

  const { data: outputData } = usePlaylist(playlist?.uuid, Boolean(playlist));
  const output = outputData?.data?.playlist;
  const progress =
    output?.uuid === playlist?.uuid ? output?.progress : undefined;
  const isRendering = Boolean(progress?.remaining);

  const name = nameOverride ?? "";
  const isNoOp = isNoOpEnhance(upscaleFactor, interpolationFactor);
  const isBusy =
    createEnhancePlaylist.isLoading ||
    updatePlaylist.isLoading ||
    runPlaylist.isLoading;
  const canRun = Boolean(selected) && !isNoOp && !isBusy;
  const canCreate = canRun && name.trim().length > 0;

  // What "Rerun" would do with the settings as they are on screen, saved or not.
  const preview = useEnhanceRunPreview(playlist?.uuid, {
    overrides: {
      source_playlist_uuid: selectedUuid || undefined,
      params: {
        upscale_factor: upscaleFactor,
        interpolation_factor: interpolationFactor,
      },
    },
    enabled: Boolean(playlist && selectedUuid) && !isNoOp && !locked,
    refreshKey: progress?.failed,
  });
  const planned = preview.data;
  // Unknown until the preview lands (or if it fails): leave the button usable.
  const canRerun = canRun && (!planned || planned.hasWork);

  const handleCreate = async () => {
    if (!canCreate) return;

    try {
      const { playlist: created, runError } =
        await createEnhancePlaylist.mutateAsync({
          name: name.trim(),
          sourcePlaylistUuid: selectedUuid,
          upscaleFactor,
          interpolationFactor,
        });

      if (runError) {
        toast.error(
          `${created.name} was created but didn't start — press “Rerun enhance” to try again.`,
        );
      } else {
        toast.success(`Enhancing into ${created.name}.`);
      }

      const linked =
        (await onCreated?.({ uuid: created.uuid, name: created.name })) ?? true;
      if (!linked) {
        toast.warning(
          `${created.name} is running, but this project could not be linked to it.`,
        );
      }
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to create the enhance playlist.");
    }
  };

  const handleRerun = async () => {
    if (!canRerun || !playlist) return;

    try {
      await updatePlaylist.mutateAsync({
        uuid: playlist.uuid,
        values: {
          name: playlist.name,
          prompt: buildEnhancePlaylistPrompt({
            sourcePlaylistUuid: selectedUuid,
            upscaleFactor,
            interpolationFactor,
          }),
        },
      });

      const { data } = await runPlaylist.mutateAsync(playlist.uuid);
      const result = data?.result;
      toast.success(
        result
          ? formatEnhanceRunSummary(t, result, "started", isRendering)
          : "Enhance run started.",
      );

      await Promise.all([
        queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlist.uuid]),
        queryClient.invalidateQueries([
          ENHANCE_RUN_PREVIEW_QUERY_KEY,
          playlist.uuid,
        ]),
      ]);
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to rerun the enhance playlist.");
    }
  };

  return (
    <AppBody>
      <AppHeader>
        <TitleRow>
          <AppTitle>Enhance playlist</AppTitle>
        </TitleRow>
        <Intro>
          Creates a playlist that tracks a source playlist and increases the
          pixel resolution and uses interpolation for slow motion. Re-run it
          later to pick up dreams added or changed.
        </Intro>
      </AppHeader>

      <Section>
        <SectionLabel htmlFor="enhance-source-playlist">
          Source playlist
        </SectionLabel>
        {selected ? (
          <EnhancePlaylistCard
            name={selected.name}
            meta={sourceMeta}
            thumbnail={selected.thumbnail}
          >
            <LinkButton
              id="enhance-source-playlist"
              type="button"
              onClick={() => setPickerOpen(true)}
            >
              Change
            </LinkButton>
          </EnhancePlaylistCard>
        ) : (
          <EmptySource
            id="enhance-source-playlist"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            Choose a playlist&hellip;
          </EmptySource>
        )}
      </Section>

      {playlist && (
        <Section>
          <SectionLabel as="h3">Enhance playlist</SectionLabel>
          <EnhancePlaylistCard
            name={output?.name ?? playlist.name}
            meta={describePlaylistContents(output)}
            thumbnail={output?.thumbnail}
          />
        </Section>
      )}

      {progress?.remaining ? (
        <Section>
          <SectionLabel as="h3">In progress</SectionLabel>
          <ProgressPanel>
            <PlaylistProgress progress={progress} />
          </ProgressPanel>
        </Section>
      ) : null}

      <Section>
        <SectionLabel as="h3">Settings</SectionLabel>
        <FactorFields>
          <EnhanceFactorFields
            upscaleFactor={upscaleFactor}
            interpolationFactor={interpolationFactor}
            onUpscaleChange={handleUpscaleChange}
            onInterpolationChange={setInterpolationFactor}
          />
        </FactorFields>
      </Section>

      <Footer>
        <PrimaryButton
          onClick={playlist ? handleRerun : handleCreate}
          disabled={playlist ? !canRerun : !canCreate}
          aria-label={isBusy ? "Starting enhance run" : undefined}
        >
          {isBusy ? (
            <SpinningIcon>
              <Loader2 size={14} strokeWidth={2.4} />
            </SpinningIcon>
          ) : playlist ? (
            "Rerun enhance"
          ) : (
            "Create & run enhance"
          )}
        </PrimaryButton>
        {!isNoOp && sourceMedia && (
          <Hint>
            {describeEnhanceResult(
              sourceMedia,
              upscaleFactor,
              interpolationFactor,
            )}
          </Hint>
        )}
        {isNoOp && <Hint>{NO_OP_HINT}</Hint>}
        {!isNoOp && !selectedUuid && <Hint>Pick a source playlist first.</Hint>}
        {!isNoOp && playlist && planned && (
          <Hint>
            {formatEnhanceRunSummary(t, planned, "preview", isRendering)}
          </Hint>
        )}
      </Footer>

      {pickerOpen && (
        <SelectPlaylistModal
          onClose={() => setPickerOpen(false)}
          selectedPlaylist={selected}
          onSelect={handleSelectSource}
        />
      )}
    </AppBody>
  );
};
