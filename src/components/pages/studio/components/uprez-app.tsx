import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { NO_OP_HINT } from "../constants/uprez-factor-options";
import { ROUTES } from "@/constants/routes.constants";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import { useUprezStore } from "@/stores/uprez.store";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import { usePlaylistMetadata } from "../hooks/usePlaylistMetadata";
import { useAddPlaylistToCache } from "../hooks/useUserPlaylists";
import { useCreateUprezPlaylist } from "../hooks/useCreateUprezPlaylist";
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
  TitleRow,
} from "./uprez-app.styled";

const CARD_THUMB = { width: 200, fit: "cover" as const };

/**
 * "Uprez" studio app: name the output, pick the factors, and start a derived
 * playlist that tracks a source playlist and uprezes each of its dreams.
 */
type Props = {
  onCreated?: (playlist: EditorProjectPlaylistRef) => Promise<boolean>;
};

export const UprezApp: React.FC<Props> = ({ onCreated }) => {
  const addPlaylistToCache = useAddPlaylistToCache();
  const { createAndRun, isSubmitting } = useCreateUprezPlaylist();

  const selected = useUprezStore((s) => s.sourcePlaylist);
  const nameOverride = useUprezStore((s) => s.nameOverride);
  const upscaleFactor = useUprezStore((s) => s.upscaleFactor);
  const interpolationFactor = useUprezStore((s) => s.interpolationFactor);
  const result = useUprezStore((s) => s.result);
  const setSourcePlaylist = useUprezStore((s) => s.setSourcePlaylist);
  const setUpscaleFactor = useUprezStore((s) => s.setUpscaleFactor);
  const setInterpolationFactor = useUprezStore((s) => s.setInterpolationFactor);
  const setResult = useUprezStore((s) => s.setResult);

  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedUuid = selected?.uuid ?? "";
  const countText = usePlaylistMetadata(selectedUuid);

  const name = nameOverride ?? "";

  const isNoOp = isNoOpUprez(upscaleFactor, interpolationFactor);
  const canSubmit =
    Boolean(selected) && name.trim().length > 0 && !isNoOp && !isSubmitting;

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
      setResult({
        uuid: created.uuid,
        name: created.name,
        run: created.run,
        runFailed: Boolean(created.runError),
      });

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

      const linked =
        (await onCreated?.({ uuid: created.uuid, name: created.name })) ?? true;
      if (!linked) {
        toast.warning(
          `${created.name} is running, but this project could not be linked to it.`,
        );
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
        <ResultPanel role="status" $error={result.runFailed}>
          <ResultTitle>
            {result.runFailed
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
          {result.runFailed && (
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
          onSelect={setSourcePlaylist}
        />
      )}
    </AppBody>
  );
};
