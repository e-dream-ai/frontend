import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { useQueryClient } from "@tanstack/react-query";
import { NO_OP_HINT } from "../constants/uprez-factor-options";
import { useUprezStore } from "@/stores/uprez.store";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import {
  PLAYLIST_QUERY_KEY,
  usePlaylist,
} from "@/api/playlist/query/usePlaylist";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import { PlaylistProgress } from "@/components/shared/dream-progress/playlist-progress";
import {
  describePlaylistContents,
  usePlaylistMetadata,
} from "../hooks/usePlaylistMetadata";
import { useAddPlaylistToCache } from "../hooks/useUserPlaylists";
import { useCreateUprezPlaylist } from "../hooks/useCreateUprezPlaylist";
import { SelectPlaylistModal } from "./select-playlist-modal";
import { UprezFactorFields } from "./uprez-factor-row";
import { UprezPlaylistCard } from "./uprez-playlist-card";
import {
  buildUprezPlaylistPrompt,
  isNoOpUprez,
} from "../utils/uprez-playlist-prompt";
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
} from "./uprez-app.styled";

type Props = {
  playlist: EditorProjectPlaylistRef | null;
  onCreated?: (playlist: EditorProjectPlaylistRef) => Promise<boolean>;
};

export const UprezApp: React.FC<Props> = ({ playlist, onCreated }) => {
  const queryClient = useQueryClient();
  const addPlaylistToCache = useAddPlaylistToCache();
  const { createAndRun, isSubmitting } = useCreateUprezPlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const runPlaylist = useRunPlaylist();

  const selected = useUprezStore((s) => s.sourcePlaylist);
  const nameOverride = useUprezStore((s) => s.nameOverride);
  const upscaleFactor = useUprezStore((s) => s.upscaleFactor);
  const interpolationFactor = useUprezStore((s) => s.interpolationFactor);
  const setSourcePlaylist = useUprezStore((s) => s.setSourcePlaylist);
  const setUpscaleFactor = useUprezStore((s) => s.setUpscaleFactor);
  const setInterpolationFactor = useUprezStore((s) => s.setInterpolationFactor);

  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedUuid = selected?.uuid ?? "";
  const sourceMeta = usePlaylistMetadata(selectedUuid);

  const { data: outputData } = usePlaylist(playlist?.uuid, Boolean(playlist));
  const output = outputData?.data?.playlist;
  const progress =
    output?.uuid === playlist?.uuid ? output?.progress : undefined;

  const name = nameOverride ?? "";
  const isNoOp = isNoOpUprez(upscaleFactor, interpolationFactor);
  const isBusy =
    isSubmitting || updatePlaylist.isLoading || runPlaylist.isLoading;
  const canRun = Boolean(selected) && !isNoOp && !isBusy;
  const canCreate = canRun && name.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;

    try {
      const created = await createAndRun({
        name: name.trim(),
        sourcePlaylistUuid: selectedUuid,
        upscaleFactor,
        interpolationFactor,
      });

      await addPlaylistToCache(created);

      if (created.runError) {
        toast.error(
          `${created.name} was created but didn't start — press “Rerun uprez” to try again.`,
        );
      } else {
        toast.success(`Uprezing into ${created.name}.`);
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
      toast.error("Failed to create the uprez playlist.");
    }
  };

  const handleRerun = async () => {
    if (!canRun || !playlist) return;

    try {
      await updatePlaylist.mutateAsync({
        uuid: playlist.uuid,
        values: {
          name: playlist.name,
          prompt: buildUprezPlaylistPrompt({
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
          ? `Uprez run started: ${result.created} new, ${result.requeued} re-queued, ${result.kept} kept, ${result.removed} removed, ${result.skipped} skipped.`
          : "Uprez run started.",
      );

      await queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlist.uuid]);
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to rerun the uprez playlist.");
    }
  };

  return (
    <AppBody>
      <AppHeader>
        <TitleRow>
          <AppTitle>Uprez playlist</AppTitle>
        </TitleRow>
        <Intro>
          Creates a playlist that tracks a source playlist and increases the
          pixel resolution and uses interpolation for slow motion. Re-run it
          later to pick up dreams added or changed.
        </Intro>
      </AppHeader>

      <Section>
        <SectionLabel htmlFor="uprez-source-playlist">
          Source playlist
        </SectionLabel>
        {selected ? (
          <UprezPlaylistCard
            name={selected.name}
            meta={sourceMeta}
            thumbnail={selected.thumbnail}
          >
            <LinkButton
              id="uprez-source-playlist"
              type="button"
              onClick={() => setPickerOpen(true)}
            >
              Change
            </LinkButton>
          </UprezPlaylistCard>
        ) : (
          <EmptySource
            id="uprez-source-playlist"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            Choose a playlist&hellip;
          </EmptySource>
        )}
      </Section>

      {playlist && (
        <Section>
          <SectionLabel as="h3">Uprez playlist</SectionLabel>
          <UprezPlaylistCard
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
          <UprezFactorFields
            upscaleFactor={upscaleFactor}
            interpolationFactor={interpolationFactor}
            onUpscaleChange={setUpscaleFactor}
            onInterpolationChange={setInterpolationFactor}
          />
        </FactorFields>
      </Section>

      <Footer>
        <PrimaryButton
          onClick={playlist ? handleRerun : handleCreate}
          disabled={playlist ? !canRun : !canCreate}
          aria-label={isBusy ? "Starting uprez run" : undefined}
        >
          {isBusy ? (
            <SpinningIcon>
              <Loader2 size={14} strokeWidth={2.4} />
            </SpinningIcon>
          ) : playlist ? (
            "Rerun uprez"
          ) : (
            "Create & run uprez"
          )}
        </PrimaryButton>
        {isNoOp && <Hint>{NO_OP_HINT}</Hint>}
        {!isNoOp && !selectedUuid && <Hint>Pick a source playlist first.</Hint>}
      </Footer>

      {pickerOpen && (
        <SelectPlaylistModal
          onClose={() => setPickerOpen(false)}
          selectedPlaylist={selected}
          onSelect={setSourcePlaylist}
        />
      )}
    </AppBody>
  );
};
