import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import {
  NO_OP_HINT,
  type InterpolationFactor,
  type UpscaleFactor,
} from "../constants/uprez-factor-options";
import { ROUTES } from "@/constants/routes.constants";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import { usePlaylistMetadata } from "../hooks/usePlaylistMetadata";
import {
  useAddPlaylistToCache,
  type PlaylistSummary,
} from "../hooks/useUserPlaylists";
import {
  useCreateUprezPlaylist,
  type CreatedUprezPlaylist,
} from "../hooks/useCreateUprezPlaylist";
import { SelectPlaylistModal } from "./select-playlist-modal";
import { UprezFactorFields } from "./uprez-factor-row";
import { isNoOpUprez } from "../utils/uprez-playlist-prompt";
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
  const addPlaylistToCache = useAddPlaylistToCache();
  const { createAndRun, isSubmitting } = useCreateUprezPlaylist();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<PlaylistSummary | null>(null);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>(2);
  const [interpolationFactor, setInterpolationFactor] =
    useState<InterpolationFactor>(2);
  const [result, setResult] = useState<CreatedUprezPlaylist | null>(null);

  const selectedUuid = selected?.uuid ?? "";
  const countText = usePlaylistMetadata(selectedUuid);

  // Follows the selected playlist until the user types their own name.
  const name = nameOverride ?? (selected ? uprezName(selected.name) : "");

  const isNoOp = isNoOpUprez(upscaleFactor, interpolationFactor);
  const canSubmit =
    Boolean(selected) && name.trim().length > 0 && !isNoOp && !isSubmitting;

  const handleSelect = (playlist: PlaylistSummary) => {
    setSelected(playlist);
    // Keep a name the user actually typed; let a blank one re-follow the source.
    setNameOverride((prev) => (prev !== null && prev.trim() ? prev : null));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setResult(null);

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

      await addPlaylistToCache(created);
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
  };

  const sourceThumb = selected?.thumbnail
    ? generateCloudflareImageURL(selected.thumbnail, CARD_THUMB)
    : undefined;

  return (
    <AppBody>
      <AppHeader>
        <AppTitle>Uprez playlist</AppTitle>
        <Intro>
          Creates a playlist that tracks a source playlist and uprezes each of
          its dreams. Re-run it later to pick up dreams added or changed.
        </Intro>
      </AppHeader>

      <Section>
        <SectionLabel htmlFor="uprez-source-playlist">
          Source playlist
        </SectionLabel>
        {selected ? (
          <SourceCard>
            {sourceThumb && <SourceThumb src={sourceThumb} alt="" />}
            <SourceInfo>
              <SourceName>{selected.name}</SourceName>
              <SourceMeta>{countText}</SourceMeta>
            </SourceInfo>
            <LinkButton
              id="uprez-source-playlist"
              type="button"
              onClick={() => setPickerOpen(true)}
            >
              Change
            </LinkButton>
          </SourceCard>
        ) : (
          <EmptySource
            id="uprez-source-playlist"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
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
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label={isSubmitting ? "Creating uprez playlist" : undefined}
        >
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
        <ResultPanel role="status" $error={Boolean(result.runError)}>
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
          selectedPlaylist={selected}
          onSelect={handleSelect}
        />
      )}
    </AppBody>
  );
};
