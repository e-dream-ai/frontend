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
import { Playlist, PlaylistItem } from "@/types/playlist.types";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Text from "../text/text";
import queryClient from "@/api/query-client";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import { ClickEvent, EventHandler } from "@szhsin/react-menu";
import { Tooltip } from "react-tooltip";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";

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
  targetItem?: Dream | Playlist;
  type: "dream" | "playlist";
};

export const PlaylistCheckboxMenu = ({
  type,
  targetItem,
}: PlaylistCheckboxMenuProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const { data: playlistsData, isLoading: isPlaylistsLoading } = usePlaylists({
    search: playlistSearch,
  });

  const targetItemPlaylistItems: PlaylistItem[] = useMemo(
    () => targetItem?.playlistItems ?? [],
    [targetItem],
  );

  const menuPlaylistsList = useMemo(() => {
    return (
      (playlistsData?.data?.playlists ?? [])
      /**
       * Remove empty name playlists
       */
        .filter((playlist) => playlist.name)
        /**
         * Filter list by search
         */
        .filter((pl) =>
          pl.name.toUpperCase().includes(playlistSearch.trim().toUpperCase()),
        )
        /**
         * Remove target playlist if is listed on the menu
         */
        .filter(
          (pl) =>
            type === "dream" ||
            (type === "playlist" && pl.id !== targetItem?.id),
        )
    );
  }, [type, targetItem, playlistsData, playlistSearch]);

  return (
    <Menu
      menuButton={
        <MenuButton data-tooltip-id="add-dream-to-playlist">
          <Tooltip
            id="add-dream-to-playlist"
            place="right-end"
            content={t(
              type === "dream"
                ? "components.playlist_checkbox_menu.add_dream_to_playlist"
                : "components.playlist_checkbox_menu.add_playlist_to_playlist",
            )}
          />
          <Text fontSize="1.2rem">
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
      {menuPlaylistsList.map((mipl) => {
        /**
         * If target item is added in one of the listed playlist, will found a playlist item to check the playlist in the menu
         */
        const foundPlaylistItem = targetItemPlaylistItems.find(
          (pi) => pi?.playlist?.id === mipl.id,
        );

        return (
          <PlaylistMenuItem
            type={type}
            key={mipl.id}
            menuItemPlaylist={mipl}
            playlistItem={foundPlaylistItem}
            targetItem={targetItem}
            checked={Boolean(foundPlaylistItem)}
          />
        );
      })}
    </Menu>
  );
};

type PlaylistMenuItemProps = {
  type: "dream" | "playlist";
  menuItemPlaylist: Playlist;
  playlistItem?: PlaylistItem;
  targetItem?: Dream | Playlist;
  childPlaylist?: Playlist;
  checked: boolean;
};

const PlaylistMenuItem = ({
  type,
  menuItemPlaylist,
  playlistItem,
  targetItem,
  checked = false,
}: PlaylistMenuItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const addPlaylistItemMutation = useAddPlaylistItem();
  const deletePlaylistItemMutation = useDeletePlaylistItem();

  const isLoading =
    addPlaylistItemMutation.isLoading || deletePlaylistItemMutation.isLoading;

  const handleAddPlaylistItem = async () => {
    try {
      const data = await addPlaylistItemMutation.mutateAsync({
        playlistUUID: menuItemPlaylist!.uuid,
        values: {
          type,
          uuid: targetItem!.uuid,
        },
      });
      if (data.success) {
        /**
         * Refetch queries
         */
        if (type === "dream") {
          queryClient.refetchQueries([DREAM_QUERY_KEY, targetItem?.uuid]);
        } else {
          queryClient.refetchQueries([PLAYLIST_QUERY_KEY, targetItem?.uuid]);
        }

        /**
         * Reset queries
         */
        queryClient.resetQueries([PLAYLIST_QUERY_KEY, menuItemPlaylist?.uuid]);

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
        playlistUUID: menuItemPlaylist!.uuid,
        itemId: playlistItem?.id,
      });

      if (data.success) {
        /**
         * Refetch queries
         */
        if (type === "dream") {
          queryClient.refetchQueries([DREAM_QUERY_KEY, targetItem?.uuid]);
        } else {
          queryClient.refetchQueries([PLAYLIST_QUERY_KEY, targetItem?.uuid]);
        }

        /**
         * Reset queries
         */
        queryClient.resetQueries([PLAYLIST_QUERY_KEY, menuItemPlaylist?.uuid]);

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

  const handleMenuItemClick: EventHandler<ClickEvent> = async (e) => {
    e.keepOpen = true;

    if (checked) {
      await handleDeletePlaylistItemMutation();
    } else {
      await handleAddPlaylistItem();
    }
  };

  return (
    <MenuItem
      type="checkbox"
      checked={checked}
      onClick={handleMenuItemClick}
      disabled={isLoading}
    >
      <Row mb="0">
        <Column>{menuItemPlaylist?.name}</Column>
        <Column ml="2">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            color={isLoading ? theme.textSecondaryColor : "transparent"}
          />
        </Column>
      </Row>
    </MenuItem>
  );
};
