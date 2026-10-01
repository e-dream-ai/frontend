import React, { useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useModels } from "@/api/model/query/useModels";
import { usePromptHistory } from "@/api/user/query/usePromptHistory";
import { useTouchRecentItem } from "@/api/user/mutation/useTouchRecentItem";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel";
import type { PromptHistorySort } from "@/types/prompt-history.types";
import { useListStepper } from "../hooks/useListStepper";
import { applyImageOrigin } from "../utils/apply-image-origin";
import { imageSettings } from "../utils/image-prompt";
import {
  toPromptHistoryEntries,
  type PromptHistoryEntry,
} from "../utils/prompt-history";
import { LibraryCard } from "./library-card";
import { LibraryModal } from "./library-modal";
import { LibrarySearch } from "./library-search";
import { PromptHistoryTextList } from "./prompt-history-text-list";
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
import {
  Body,
  CancelBtn,
  EmptyMsg,
  LoadingMore,
  Sentinel,
  SkeletonCard,
} from "./select-modal.styled";
import {
  HistoryList,
  LibraryGrid,
  Segmented,
  SkeletonRow,
  ToggleButton,
  ToggleChip,
  Toolbar,
} from "./prompt-library.styled";

interface Props {
  onClose: () => void;
}

const SORT_OPTIONS: readonly { value: PromptHistorySort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "date", label: "Newest" },
  { value: "name", label: "A–Z" },
];

const NO_ENTRIES: PromptHistoryEntry[] = [];

interface DetailsProps {
  entry: PromptHistoryEntry;
  modelLabel: string;
  onUsePrompt: () => void;
  onUseAllSettings: () => void;
}

const PromptHistoryDetails: React.FC<DetailsProps> = ({
  entry,
  modelLabel,
  onUsePrompt,
  onUseAllSettings,
}) => {
  const settings = imageSettings(entry.origin, modelLabel).join(" · ");

  return (
    <Details>
      <DetailsText>
        <DetailsTitleLine>
          <DetailsName>{entry.name}</DetailsName>
          {settings ? <DetailsMeta>{settings}</DetailsMeta> : null}
        </DetailsTitleLine>
        <DetailsPrompt>{entry.origin.prompt}</DetailsPrompt>
        {entry.origin.negativePrompt ? (
          <DetailsMeta>Negative: {entry.origin.negativePrompt}</DetailsMeta>
        ) : null}
      </DetailsText>
      <DetailsButtons>
        <CancelBtn type="button" onClick={onUsePrompt}>
          Use prompt
        </CancelBtn>
        {entry.origin.model ? (
          <DetailsButton type="button" onClick={onUseAllSettings}>
            Use all settings
          </DetailsButton>
        ) : null}
      </DetailsButtons>
    </Details>
  );
};

export const PromptHistoryModal: React.FC<Props> = ({ onClose }) => {
  const model = useStudioStore((s) => s.imageGenParams.model);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350).trim();
  const [sort, setSort] = useState<PromptHistorySort>("recent");
  const [currentModelOnly, setCurrentModelOnly] = useState(false);
  const [allVariations, setAllVariations] = useState(false);
  const [showText, setShowText] = useState(false);

  const {
    data,
    isInitialLoading: isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePromptHistory({
    search: debouncedSearch || undefined,
    algorithm: currentModelOnly ? model : undefined,
    sort,
    distinct: !allVariations,
  });
  const { mutate: touchRecentItem } = useTouchRecentItem();

  const { data: modelsData } = useModels({ mediaType: "image" });
  const modelLabels = useMemo(
    () =>
      new Map(
        (modelsData?.data?.models ?? []).map((m): [string, string] => [
          m.id,
          m.label,
        ]),
      ),
    [modelsData?.data?.models],
  );
  const labelOf = (algorithm: string) =>
    modelLabels.get(algorithm) ?? algorithm;

  const entries = useMemo(
    () =>
      data
        ? toPromptHistoryEntries(
            data.pages.flatMap((page) => page.data?.dreams ?? []),
          )
        : NO_ENTRIES,
    [data],
  );
  const total = data?.pages[0]?.data?.count ?? entries.length;

  const lightbox = useListStepper(entries);
  const { rootRef, sentinelRef } = useInfiniteScrollSentinel<HTMLDivElement>({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const finish = (entry: PromptHistoryEntry, apply: () => void) => {
    apply();
    touchRecentItem({ type: "prompt", dreamUuid: entry.uuid });
    onClose();
  };

  const openEntry = lightbox.current;
  const isFiltered = Boolean(debouncedSearch) || currentModelOnly;
  const unit = allVariations ? "image" : "prompt";

  return (
    <LibraryModal
      title="Prompt history"
      status={`${total} ${unit}${total === 1 ? "" : "s"}`}
      onClose={onClose}
      preview={
        openEntry ? (
          <StudioLightbox
            index={lightbox.index}
            count={entries.length}
            name={openEntry.name}
            onClose={lightbox.close}
            onStep={lightbox.step}
            label="Prompt preview"
            prevUrl={entries[lightbox.index - 1]?.thumbnail}
            nextUrl={entries[lightbox.index + 1]?.thumbnail}
            details={
              <PromptHistoryDetails
                entry={openEntry}
                modelLabel={labelOf(openEntry.origin.algorithm)}
                onUsePrompt={() =>
                  finish(openEntry, () =>
                    useStudioStore
                      .getState()
                      .setImagePrompt(openEntry.origin.prompt),
                  )
                }
                onUseAllSettings={() =>
                  finish(openEntry, () => applyImageOrigin(openEntry.origin))
                }
              />
            }
          >
            <img src={openEntry.thumbnail} alt={openEntry.name} />
          </StudioLightbox>
        ) : null
      }
    >
      <Toolbar>
        <LibrarySearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name or prompt..."
          label="Search prompt history"
        />
        <Segmented role="group" aria-label="Sort prompts">
          {SORT_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => setSort(option.value)}
            >
              {option.label}
            </ToggleButton>
          ))}
        </Segmented>
        <ToggleChip
          type="button"
          aria-pressed={currentModelOnly}
          onClick={() => setCurrentModelOnly((on) => !on)}
        >
          {labelOf(model)} only
        </ToggleChip>
        <ToggleChip
          type="button"
          aria-pressed={allVariations}
          onClick={() => setAllVariations((on) => !on)}
        >
          Every image
        </ToggleChip>
        <ToggleChip
          type="button"
          aria-pressed={showText}
          onClick={() => setShowText((on) => !on)}
        >
          Show as text
        </ToggleChip>
      </Toolbar>

      <Body ref={rootRef} aria-busy={isLoading}>
        {isLoading ? (
          showText ? (
            <HistoryList aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <SkeletonRow />
                </li>
              ))}
            </HistoryList>
          ) : (
            <LibraryGrid aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </LibraryGrid>
          )
        ) : isError ? (
          <EmptyMsg>
            Prompt history didn&rsquo;t load. Close this and try again.
          </EmptyMsg>
        ) : entries.length === 0 ? (
          <EmptyMsg>
            {isFiltered
              ? "No prompts match. Try another search or turn off the model filter."
              : "No prompts yet. Images you generate show up here."}
          </EmptyMsg>
        ) : (
          <>
            {showText ? (
              <PromptHistoryTextList
                entries={entries}
                modelLabels={modelLabels}
                onOpen={lightbox.open}
              />
            ) : (
              <LibraryGrid>
                {entries.map((entry) => (
                  <LibraryCard
                    key={entry.uuid}
                    uuid={entry.uuid}
                    name={entry.name}
                    thumbnail={entry.thumbnail}
                    width={entry.width}
                    height={entry.height}
                    onOpen={lightbox.open}
                  />
                ))}
              </LibraryGrid>
            )}
            <Sentinel ref={sentinelRef} aria-hidden="true" />
            {isFetchingNextPage ? (
              <LoadingMore>Loading more...</LoadingMore>
            ) : null}
          </>
        )}
      </Body>
    </LibraryModal>
  );
};
