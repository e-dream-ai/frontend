import { memo } from "react";
import { Check } from "lucide-react";
import { parseUprezPlaylistPrompt } from "@/types/playlist.types";
import { generateCloudflareImageURL } from "@/utils/image-handler";
import type { PlaylistSummary } from "../hooks/useUserPlaylists";
import {
  PlaylistTile,
  TileBadge,
  TileCheck,
  TileName,
  TilePlaceholder,
  TileThumb,
} from "./select-playlist-modal.styled";

const THUMB_SIZE = { width: 320, fit: "cover" as const };

interface Props {
  playlist: PlaylistSummary;
  isSelected: boolean;
  onHighlight: (playlist: PlaylistSummary) => void;
  onConfirm: (playlist: PlaylistSummary) => void;
}

export const SelectPlaylistCard = memo(function SelectPlaylistCard({
  playlist,
  isSelected,
  onHighlight,
  onConfirm,
}: Props) {
  const thumb = playlist.thumbnail
    ? generateCloudflareImageURL(playlist.thumbnail, THUMB_SIZE)
    : undefined;

  return (
    <PlaylistTile
      type="button"
      $selected={isSelected}
      aria-pressed={isSelected}
      onClick={() => onHighlight(playlist)}
      onDoubleClick={() => onConfirm(playlist)}
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
          <TileCheck aria-hidden="true">
            <Check size={12} strokeWidth={3} />
          </TileCheck>
        )}
      </TileThumb>
      <TileName $selected={isSelected}>{playlist.name}</TileName>
    </PlaylistTile>
  );
});
