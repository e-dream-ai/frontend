import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { parseUprezPlaylistPrompt } from "@/types/playlist.types";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import { secondsToTimeFormat } from "@/utils/video.utils";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
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
  Footer,
  CountLabel,
  FooterButtons,
  CancelBtn,
  AddBtn,
} from "./select-modal.styled";
import {
  PlaylistGrid,
  PlaylistTile,
  TileBadge,
  TileCheck,
  TileName,
  TilePlaceholder,
  TileThumb,
} from "./select-playlist-modal.styled";

const THUMB_SIZE = { width: 320, fit: "cover" as const };

interface Props {
  onClose: () => void;
  /** Currently chosen playlist, pre-highlighted when the modal opens. */
  selectedUuid?: string;
  onSelect: (uuid: string) => void;
}

/**
 * Picks one playlist from a thumbnail grid. Single-select: the footer reports
 * the highlighted playlist's dream count before you commit, so you can tell a
 * full playlist from an empty one without leaving the modal.
 */
export const SelectPlaylistModal: React.FC<Props> = ({
  onClose,
  selectedUuid,
  onSelect,
}) => {
  const { playlists, isLoading } = useUserPlaylists();
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(selectedUuid ?? "");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return playlists;
    return playlists.filter((p) => p.name.toLowerCase().includes(term));
  }, [playlists, search]);

  // The list endpoint carries no dream counts, so fetch just the highlighted
  // one. Shares usePlaylist's query key, so the caller's card reads it warm.
  const detailQuery = usePlaylist(highlighted, Boolean(highlighted));
  const detail = useMemo(() => {
    const playlist = detailQuery.data?.data?.playlist;
    // keepPreviousData holds the last playlist's payload; match the uuid or
    // we'd report the previous selection's dream count.
    return playlist?.uuid === highlighted ? playlist : undefined;
  }, [detailQuery.data, highlighted]);

  const highlightedName = playlists.find((p) => p.uuid === highlighted)?.name;

  const countLabel = useMemo(() => {
    if (!highlighted) {
      return `${playlists.length} playlist${playlists.length === 1 ? "" : "s"}`;
    }
    if (!detail) {
      return detailQuery.isFetching
        ? `${highlightedName} — counting dreams…`
        : `${highlightedName}`;
    }
    const count = detail.totalDreamCount;
    const dreams =
      count === undefined
        ? "dream count unavailable"
        : `${count} dream${count === 1 ? "" : "s"}`;
    // The API sends totalDurationSeconds, not a preformatted string.
    return typeof detail.totalDurationSeconds === "number"
      ? `${highlightedName} — ${dreams} · ${secondsToTimeFormat(
          detail.totalDurationSeconds,
        )}`
      : `${highlightedName} — ${dreams}`;
  }, [
    highlighted,
    highlightedName,
    detail,
    detailQuery.isFetching,
    playlists.length,
  ]);

  // Escape closes, Tab stays inside, the page behind stops scrolling.
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  const confirm = (uuid: string) => {
    onSelect(uuid);
    onClose();
  };

  const isEmpty = !isLoading && visible.length === 0;

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

        <Body>
          {isLoading ? (
            <PlaylistGrid>
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </PlaylistGrid>
          ) : isEmpty ? (
            <EmptyMsg>
              {playlists.length === 0
                ? "No playlists yet."
                : "No playlists match your search."}
            </EmptyMsg>
          ) : (
            <PlaylistGrid>
              {visible.map((playlist) => {
                const isSelected = highlighted === playlist.uuid;
                const thumb = playlist.thumbnail
                  ? generateCloudflareImageURL(playlist.thumbnail, THUMB_SIZE)
                  : undefined;
                return (
                  <PlaylistTile
                    key={playlist.uuid}
                    type="button"
                    $selected={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => setHighlighted(playlist.uuid)}
                    onDoubleClick={() => confirm(playlist.uuid)}
                  >
                    <TileThumb $selected={isSelected}>
                      {thumb ? (
                        <img src={thumb} alt="" loading="lazy" />
                      ) : (
                        <TilePlaceholder>No art</TilePlaceholder>
                      )}
                      {parseUprezPlaylistPrompt(playlist.prompt) && (
                        <TileBadge>uprez</TileBadge>
                      )}
                      {isSelected && (
                        <TileCheck>
                          <Check size={12} strokeWidth={3} />
                        </TileCheck>
                      )}
                    </TileThumb>
                    <TileName $selected={isSelected}>{playlist.name}</TileName>
                  </PlaylistTile>
                );
              })}
            </PlaylistGrid>
          )}
        </Body>

        <Footer>
          <CountLabel>{countLabel}</CountLabel>
          <FooterButtons>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <AddBtn
              onClick={() => confirm(highlighted)}
              disabled={!highlighted}
            >
              Select
            </AddBtn>
          </FooterButtons>
        </Footer>
      </Panel>
    </Overlay>
  );
};
