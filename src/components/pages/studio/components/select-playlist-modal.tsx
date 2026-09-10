import React, { useCallback, useMemo, useState } from "react";
import { usePlaylistMetadata } from "../hooks/usePlaylistMetadata";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  useInfiniteUserPlaylists,
  type PlaylistSummary,
} from "../hooks/useUserPlaylists";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel";
import { SelectPlaylistCard } from "./select-playlist-card";
import {
  Overlay,
  Panel,
  Header,
  Title,
  CloseBtn,
  SearchRow,
  SearchInput,
  Body,
  EmptyMsg,
  SkeletonCard,
  CountLabel,
  FooterButtons,
  CancelBtn,
  AddBtn,
  LoadingMore,
  Sentinel,
} from "./select-modal.styled";
import { PlaylistFooter, PlaylistGrid } from "./select-playlist-modal.styled";

interface Props {
  onClose: () => void;
  /** Currently chosen playlist, pre-highlighted when the modal opens. */
  selectedPlaylist: PlaylistSummary | null;
  onSelect: (playlist: PlaylistSummary) => void;
}

/**
 * Picks one playlist from a thumbnail grid. Single-select: the footer reports
 * the highlighted playlist's dream count before you commit, so you can tell a
 * full playlist from an empty one without leaving the modal.
 */
export const SelectPlaylistModal: React.FC<Props> = ({
  onClose,
  selectedPlaylist,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [highlighted, setHighlighted] = useState(selectedPlaylist);
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteUserPlaylists(debouncedSearch);
  const { rootRef, sentinelRef } = useInfiniteScrollSentinel<HTMLDivElement>({
    hasNextPage: hasNextPage && !isError,
    isFetchingNextPage: isFetching,
    fetchNextPage,
  });
  const playlists = useMemo(
    () => data?.pages.flatMap((page) => page.playlists) ?? [],
    [data?.pages],
  );
  const totalCount = data?.pages[0]?.count ?? 0;
  const metadata = usePlaylistMetadata(highlighted?.uuid ?? "");
  const countLabel = highlighted
    ? `${highlighted.name} — ${metadata}`
    : `${totalCount} playlist${totalCount === 1 ? "" : "s"}`;

  // Escape closes, Tab stays inside, the page behind stops scrolling.
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  const confirm = useCallback(
    (playlist: PlaylistSummary) => {
      onSelect(playlist);
      onClose();
    },
    [onSelect, onClose],
  );

  const isEmpty = !isLoading && playlists.length === 0;

  return (
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select a playlist"
    >
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Select a playlist</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>

        <SearchRow>
          <SearchInput
            placeholder="Search playlists..."
            aria-label="Search playlists"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-autofocus
          />
        </SearchRow>

        <Body key={debouncedSearch} ref={rootRef}>
          {isError && !data ? (
            <EmptyMsg role="alert">
              Could not load your playlists.
              <br />
              <CancelBtn
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying…" : "Try again"}
              </CancelBtn>
            </EmptyMsg>
          ) : isLoading ? (
            <PlaylistGrid>
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </PlaylistGrid>
          ) : isEmpty ? (
            <EmptyMsg>
              {debouncedSearch
                ? "No playlists match your search."
                : "No playlists yet."}
            </EmptyMsg>
          ) : (
            <>
              <PlaylistGrid>
                {playlists.map((playlist) => (
                  <SelectPlaylistCard
                    key={playlist.uuid}
                    playlist={playlist}
                    isSelected={highlighted?.uuid === playlist.uuid}
                    onHighlight={setHighlighted}
                    onConfirm={confirm}
                  />
                ))}
              </PlaylistGrid>
              <Sentinel ref={sentinelRef} aria-hidden="true" />
              {isFetchingNextPage && <LoadingMore>Loading more…</LoadingMore>}
              {isError && (
                <EmptyMsg role="alert">
                  Could not load more playlists.
                  <br />
                  <CancelBtn
                    type="button"
                    onClick={() => void fetchNextPage()}
                    disabled={isFetching}
                  >
                    {isFetching ? "Retrying…" : "Try again"}
                  </CancelBtn>
                </EmptyMsg>
              )}
            </>
          )}
        </Body>

        <PlaylistFooter>
          <CountLabel aria-live="polite">{countLabel}</CountLabel>
          <FooterButtons>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <AddBtn
              onClick={() => highlighted && confirm(highlighted)}
              disabled={!highlighted}
            >
              Select
            </AddBtn>
          </FooterButtons>
        </PlaylistFooter>
      </Panel>
    </Overlay>
  );
};
