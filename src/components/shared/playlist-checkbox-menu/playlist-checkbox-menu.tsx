import { useMemo, useState } from "react";
import styled from "styled-components";
import { Menu, MenuButton, MenuItem, FocusableItem } from "../menu/menu";
import Row, { Column } from "../row/row";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Text from "../text/text";

const StyledInput = styled.input`
  background: ${(props) => props.theme.inputBackgroundColor};
  color: ${(props) => props.theme.inputTextColorPrimary};
  border: 0;
  padding: 0.25rem;
  font-size: 1rem;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }
`;

type PlaylistCheckboxMenuProps = {
  dream?: Dream;
};

export const PlaylistCheckboxMenu = ({ dream }: PlaylistCheckboxMenuProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const { data: playlistsData, isLoading: isPlaylistsLoading } = usePlaylists({
    search: playlistSearch,
  });

  const includedPlaylists: number[] = useMemo(() => {
    return (dream?.playlistItems ?? [])
      .filter((pi) => Boolean(pi?.playlist?.id))
      .map((pi) => pi.playlist!.id);
  }, [dream]);

  const menuPlaylists = useMemo(() => {
    return (playlistsData?.data?.playlists ?? [])
      .filter((playlist) => playlist.name)
      .filter((pl) =>
        pl.name.toUpperCase().includes(playlistSearch.trim().toUpperCase()),
      );
  }, [playlistsData, playlistSearch]);

  return (
    <Menu
      menuButton={
        <MenuButton>
          <Text color={theme.textPrimaryColor} fontSize="1.2rem">
            <FontAwesomeIcon icon={faPlus} />
          </Text>
        </MenuButton>
      }
      onMenuChange={(e) => e.open && setPlaylistSearch("")}
      menuClassName="my-menu"
    >
      <FocusableItem>
        {({ ref }) => (
          <Row mb="0">
            <Column mb="0">
              <StyledInput
                ref={ref}
                type="text"
                placeholder={t("components.playlist_checkbox_menu.placeholder")}
                value={playlistSearch}
                onChange={(e) => setPlaylistSearch(e.target.value)}
              />
            </Column>
            <Column ml="2" mb="0" justifyContent="center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                color={
                  isPlaylistsLoading ? theme.textSecondaryColor : "transparent"
                }
              />
            </Column>
          </Row>
        )}
      </FocusableItem>
      {menuPlaylists.map((pl) => (
        <PlaylistMenuItem
          key={pl.id}
          playlist={pl}
          dreamId={dream?.id}
          checked={includedPlaylists.includes(pl.id)}
        />
      ))}
    </Menu>
  );
};

type PlaylistMenuItemProps = {
  playlist: Playlist;
  dreamId?: number;
  checked: boolean;
};

const PlaylistMenuItem = ({
  playlist,
  dreamId,
  checked = false,
}: PlaylistMenuItemProps) => {
  const { t } = useTranslation();
  const addPlaylistItemMutation = useAddPlaylistItem();
  const deletePlaylistItemMutation = useDeletePlaylistItem();

  const handleAddPlaylistItem = async () => {
    try {
      const data = await addPlaylistItemMutation.mutateAsync({
        type: "dream",
        id: dreamId,
        playlistId: playlist.id,
      });
      if (data.success) {
        toast.success(
          t(
            "components.playlist_checkbox_menu.playlist_item_successfully_added",
          ),
        );
      } else {
        toast.error(
          t("components.playlist_checkbox_menu.error_adding_playlist_item"),
        );
      }
    } catch (error) {
      toast.error(
        t("components.playlist_checkbox_menu.error_adding_playlist_item"),
      );
    }
  };

  const handleDeletePlaylistItemMutation = async () => {
    try {
      const data = await deletePlaylistItemMutation.mutateAsync({
        itemId: dreamId,
        playlistId: playlist.id,
      });

      if (data.success) {
        toast.success(
          t(
            "components.playlist_checkbox_menu.playlist_item_successfully_removed",
          ),
        );
      } else {
        toast.error(
          t("components.playlist_checkbox_menu.error_removing_playlist_item"),
        );
      }
    } catch (error) {
      toast.error(
        t("components.playlist_checkbox_menu.error_removing_playlist_item"),
      );
    }
  };

  const handleMenuItemClick = async () => {
    if (checked) {
      await handleDeletePlaylistItemMutation();
    } else {
      await handleAddPlaylistItem();
    }
  };

  return (
    <MenuItem type="checkbox" checked={checked} onClick={handleMenuItemClick}>
      {playlist.name}
    </MenuItem>
  );
};
