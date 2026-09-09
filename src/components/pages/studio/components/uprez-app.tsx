import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { ROUTES } from "@/constants/routes.constants";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import { secondsToTimeFormat } from "@/utils/video.utils";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import {
  useCreateUprezPlaylist,
  type CreatedUprezPlaylist,
} from "../hooks/useCreateUprezPlaylist";
import { SelectPlaylistModal } from "./select-playlist-modal";
import {
  isNoOpUprez,
  NO_OP_HINT,
  UprezFactorFields,
  type InterpolationFactor,
  type UpscaleFactor,
} from "./uprez-factor-row";
import {
  AppBody,
  EmptySource,
  FactorFields,
  Footer,
  Hint,
  Intro,
  LinkButton,
  PrimaryButton,
  ResultLink,
  ResultPanel,
  ResultText,
  ResultTitle,
  Section,
  SectionLabel,
  SourceCard,
  SourceInfo,
  SourceMeta,
  SourceName,
  SourceThumb,
  SpinningIcon,
  TextInput,
} from "./uprez-app.styled";

const uprezName = (sourceName: string) => `${sourceName} (uprez)`;

const CARD_THUMB = { width: 200, fit: "cover" as const };

/**
 * "Uprez" studio app: name the output, pick the factors, and start a derived
 * playlist that tracks a source playlist and uprezes each of its dreams.
 *
 * Nothing is persisted — a remembered playlist uuid goes stale the moment that
 * playlist is deleted, and re-picking costs one click.
 */
export const UprezApp: React.FC = () => {
  const { playlists, addPlaylistToCache } = useUserPlaylists();
  const { createAndRun, isSubmitting } = useCreateUprezPlaylist();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState("");
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>(2);
  const [interpolationFactor, setInterpolationFactor] =
    useState<InterpolationFactor>(2);
  const [result, setResult] = useState<CreatedUprezPlaylist | null>(null);

  const selected = useMemo(
    () => playlists.find((p) => p.uuid === selectedUuid) ?? null,
    [playlists, selectedUuid],
  );

  // The list endpoint carries no dream counts. The modal fetched this same
  // query while you were picking, so it's usually already warm here.
  const detailQuery = usePlaylist(selectedUuid, Boolean(selectedUuid));
  const detail = useMemo(() => {
    const playlist = detailQuery.data?.data?.playlist;
    // keepPreviousData holds the previous playlist's payload; match the uuid
    // or we'd caption this playlist with the last one's dream count.
    return playlist?.uuid === selectedUuid ? playlist : undefined;
  }, [detailQuery.data, selectedUuid]);

  const countText = useMemo(() => {
    if (!detail) {
      return detailQuery.isFetching
        ? "counting dreams…"
        : "dream count unavailable";
    }
    const count = detail.totalDreamCount;
    const dreams =
      count === undefined
        ? "dream count unavailable"
        : `${count} dream${count === 1 ? "" : "s"}`;
    // The API sends totalDurationSeconds, not a preformatted string.
    return typeof detail.totalDurationSeconds === "number"
      ? `${dreams} · ${secondsToTimeFormat(detail.totalDurationSeconds)}`
      : dreams;
  }, [detail, detailQuery.isFetching]);

  // Follows the selected playlist until the user types their own name.
  const name = nameOverride ?? (selected ? uprezName(selected.name) : "");

  const isNoOp = isNoOpUprez(upscaleFactor, interpolationFactor);
  const canSubmit =
    Boolean(selectedUuid) && name.trim().length > 0 && !isNoOp && !isSubmitting;

  const handleSelect = useCallback((uuid: string) => {
    setSelectedUuid(uuid);
    // Keep a name the user actually typed; let a blank one re-follow the source.
    setNameOverride((prev) => (prev !== null && prev.trim() ? prev : null));
    setResult(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    // Opened synchronously so the popup blocker still counts this as
    // user-initiated; it's navigated once the create call returns a uuid.
    const newTab = window.open("", "_blank");

    try {
      const created = await createAndRun({
        name: name.trim(),
        sourcePlaylistUuid: selectedUuid,
        upscaleFactor,
        interpolationFactor,
      });

      addPlaylistToCache({ uuid: created.uuid, name: created.name });
      setResult(created);

      const href = `${window.location.origin}${ROUTES.VIEW_PLAYLIST}/${created.uuid}`;
      if (newTab) {
        newTab.location.href = href;
      } else {
        toast.info("Pop-up blocked — use the link below to open the playlist.");
      }

      if (created.runError) {
        toast.error(
          `${created.name} was created but didn't start — press “Run uprez” on its page.`,
        );
      } else {
        toast.success(`Uprezing into ${created.name}.`);
      }
    } catch (err) {
      newTab?.close();
      Bugsnag.notify(err as Error);
      toast.error("Failed to create the uprez playlist.");
    }
  }, [
    canSubmit,
    createAndRun,
    name,
    selectedUuid,
    upscaleFactor,
    interpolationFactor,
    addPlaylistToCache,
  ]);

  const sourceThumb = selected?.thumbnail
    ? generateCloudflareImageURL(selected.thumbnail, CARD_THUMB)
    : undefined;

  return (
    <AppBody>
      <Intro>
        Creates a playlist that tracks a source playlist and uprezes each of its
        dreams. Re-run it later to pick up dreams added or changed.
      </Intro>

      <Section>
        <SectionLabel>Source playlist</SectionLabel>
        {selected ? (
          <SourceCard>
            {sourceThumb && <SourceThumb src={sourceThumb} alt="" />}
            <SourceInfo>
              <SourceName>{selected.name}</SourceName>
              <SourceMeta>{countText}</SourceMeta>
            </SourceInfo>
            <LinkButton onClick={() => setPickerOpen(true)}>Change</LinkButton>
          </SourceCard>
        ) : (
          <EmptySource type="button" onClick={() => setPickerOpen(true)}>
            Choose a playlist…
          </EmptySource>
        )}
      </Section>

      <Section>
        <SectionLabel htmlFor="uprez-playlist-name">
          New playlist name
        </SectionLabel>
        <TextInput
          id="uprez-playlist-name"
          value={name}
          onChange={(e) => setNameOverride(e.target.value)}
          placeholder="Named after the source playlist"
          disabled={!selected}
        />
      </Section>

      <Section>
        <SectionLabel>Settings</SectionLabel>
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
        <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? (
            <SpinningIcon>
              <Loader2 size={14} strokeWidth={2.4} />
            </SpinningIcon>
          ) : (
            "Create & run uprez"
          )}
        </PrimaryButton>
        {isNoOp && <Hint>{NO_OP_HINT}</Hint>}
        {!isNoOp && !selectedUuid && <Hint>Pick a source playlist first.</Hint>}
      </Footer>

      {result && (
        <ResultPanel $error={Boolean(result.runError)}>
          <ResultTitle>
            {result.runError
              ? `${result.name} created, but didn't start`
              : `${result.name} is uprezing`}
          </ResultTitle>
          {result.run && (
            <ResultText>
              {result.run.created} queued, {result.run.requeued} re-queued,{" "}
              {result.run.kept} already done, {result.run.skipped} skipped
              (source dream not processed yet).
            </ResultText>
          )}
          {result.runError && (
            <ResultText>
              Open the playlist and press “Run uprez” to start it.
            </ResultText>
          )}
          <ResultLink to={`${ROUTES.VIEW_PLAYLIST}/${result.uuid}`}>
            Open playlist
          </ResultLink>
        </ResultPanel>
      )}

      {pickerOpen && (
        <SelectPlaylistModal
          onClose={() => setPickerOpen(false)}
          selectedUuid={selectedUuid}
          onSelect={handleSelect}
        />
      )}
    </AppBody>
  );
};

export default UprezApp;
