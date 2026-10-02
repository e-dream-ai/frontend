import React, { useDeferredValue, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useRecentItems } from "@/api/user/query/useRecentItems";
import { useTouchRecentItem } from "@/api/user/mutation/useTouchRecentItem";
import type { RecentItem } from "@/types/recent-item.types";
import type { StylePreset } from "@/types/style-preset.types";
import { useListStepper } from "../hooks/useListStepper";
import { useStylePresets } from "../hooks/useStylePresets";
import {
  applyStylePrompt,
  matchesStyleSearch,
  sortStylePresets,
  type StylePresetSort,
} from "../utils/style-presets";
import { LibraryCard } from "./library-card";
import { LibraryModal } from "./library-modal";
import { LibrarySearch } from "./library-search";
import { StudioLightbox } from "./studio-lightbox";
import {
  Details,
  DetailsButton,
  DetailsButtons,
  DetailsMeta,
  DetailsName,
  DetailsPrompt,
  DetailsText,
  DetailsTitleLine,
} from "./image-details.styled";
import { Body, EmptyMsg, SkeletonCard } from "./select-modal.styled";
import {
  LibraryGrid,
  Segmented,
  ToggleButton,
  Toolbar,
  ToolbarSelect,
} from "./prompt-library.styled";

interface Props {
  onClose: () => void;
}

const NO_PRESETS: StylePreset[] = [];
const NO_RECENT_ITEMS: RecentItem[] = [];
const NO_RANKS = new Map<string, number>();

const SORT_OPTIONS: readonly { value: StylePresetSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "A–Z" },
  { value: "shuffle", label: "Shuffle" },
];

interface DetailsProps {
  preset: StylePreset;
  onApply: () => void;
}

const StylePresetDetails: React.FC<DetailsProps> = ({ preset, onApply }) => (
  <Details>
    <DetailsText>
      <DetailsTitleLine>
        <DetailsName>{preset.name}</DetailsName>
        {preset.section ? <DetailsMeta>{preset.section}</DetailsMeta> : null}
      </DetailsTitleLine>
      <DetailsPrompt>{preset.stylePrompt}</DetailsPrompt>
    </DetailsText>
    <DetailsButtons>
      <DetailsButton type="button" onClick={onApply}>
        Apply style
      </DetailsButton>
    </DetailsButtons>
  </Details>
);

export const StylePresetsModal: React.FC<Props> = ({ onClose }) => {
  const model = useStudioStore((s) => s.imageGenParams.model);
  const {
    data: presets = NO_PRESETS,
    isInitialLoading: isLoading,
    isError,
  } = useStylePresets(model);
  const { data: recentItems = NO_RECENT_ITEMS } = useRecentItems("style");
  const { mutate: touchRecentItem } = useTouchRecentItem();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [section, setSection] = useState("");
  const [sort, setSort] = useState<StylePresetSort>("recent");
  const [shuffleRank, setShuffleRank] = useState(NO_RANKS);

  const sections = useMemo(
    () =>
      Array.from(
        new Set(presets.map((preset) => preset.section).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [presets],
  );

  const recentRank = useMemo(
    () => new Map(recentItems.map((item, rank) => [item.dreamUuid, rank])),
    [recentItems],
  );

  const visiblePresets = useMemo(
    () =>
      sortStylePresets(
        presets.filter(
          (preset) =>
            (!section || preset.section === section) &&
            matchesStyleSearch(preset, deferredSearch),
        ),
        sort,
        { recent: recentRank, shuffle: shuffleRank },
      ),
    [presets, section, deferredSearch, sort, recentRank, shuffleRank],
  );

  const lightbox = useListStepper(visiblePresets);

  const handleSort = (value: StylePresetSort) => {
    if (value === "shuffle") {
      setShuffleRank(
        new Map(presets.map((preset) => [preset.uuid, Math.random()])),
      );
    }
    setSort(value);
  };

  const applyStyle = (preset: StylePreset) => {
    const { imagePrompt, setImagePrompt } = useStudioStore.getState();
    setImagePrompt(applyStylePrompt(imagePrompt, preset));
    touchRecentItem({ type: "style", dreamUuid: preset.uuid });
    onClose();
  };

  const openPreset = lightbox.current;
  const count = visiblePresets.length;

  return (
    <LibraryModal
      title="Apply style"
      status={`${count} style${count === 1 ? "" : "s"}`}
      onClose={onClose}
      preview={
        openPreset ? (
          <StudioLightbox
            index={lightbox.index}
            count={count}
            name={openPreset.name}
            onClose={lightbox.close}
            onStep={lightbox.step}
            label="Style preview"
            prevUrl={visiblePresets[lightbox.index - 1]?.thumbnail}
            nextUrl={visiblePresets[lightbox.index + 1]?.thumbnail}
            details={
              <StylePresetDetails
                preset={openPreset}
                onApply={() => applyStyle(openPreset)}
              />
            }
          >
            <img src={openPreset.thumbnail} alt={openPreset.name} />
          </StudioLightbox>
        ) : null
      }
    >
      <Toolbar>
        <LibrarySearch
          value={search}
          onChange={setSearch}
          placeholder="Search styles by name or section..."
          label="Search styles"
        />
        <ToolbarSelect
          aria-label="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="">All sections</option>
          {sections.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </ToolbarSelect>
        <Segmented role="group" aria-label="Sort styles">
          {SORT_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => handleSort(option.value)}
            >
              {option.label}
            </ToggleButton>
          ))}
        </Segmented>
      </Toolbar>

      <Body aria-busy={isLoading}>
        {isLoading ? (
          <LibraryGrid aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </LibraryGrid>
        ) : isError ? (
          <EmptyMsg>
            Styles didn&rsquo;t load. Close this and try again.
          </EmptyMsg>
        ) : count === 0 ? (
          <EmptyMsg>
            {deferredSearch || section
              ? "No styles match. Try another search or section."
              : "No styles for this model yet."}
          </EmptyMsg>
        ) : (
          <LibraryGrid>
            {visiblePresets.map((preset) => (
              <LibraryCard
                key={preset.uuid}
                uuid={preset.uuid}
                name={preset.name}
                thumbnail={preset.thumbnail}
                width={preset.width}
                height={preset.height}
                onOpen={lightbox.open}
              />
            ))}
          </LibraryGrid>
        )}
      </Body>
    </LibraryModal>
  );
};
