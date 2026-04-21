import { yupResolver } from "@hookform/resolvers/yup";
import { Button, ItemCardList, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router-dom";
import UpdatePlaylistSchema, {
  UpdatePlaylistFormValues,
} from "@/schemas/update-playlist.schema";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { ItemCard } from "@/components/shared";
import Restricted from "@/components/shared/restricted/restricted";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import { PLAYLIST_PERMISSIONS } from "@/constants/permissions.constants";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { HandleChangeFile } from "@/types/media.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlaylistPlay from "@/icons/playlist-play";
import {
  faAlignLeft,
  faCalendar,
  faEye,
  faFileVideo,
  faPlus,
  faRankingStar,
  faRepeat,
  faSave,
  faShield,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/components/shared/select/select";
import { getHiddenOptions, getNsfwOptions } from "@/constants/select.constants";
import { usePlaylistState } from "./usePlaylistState";
import { usePlaylistHandlers } from "./usePlaylistHandlers";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { PLAYLIST_REFERENCES_QUERY_KEY } from "@/api/playlist/query/usePlaylistReferences";
import queryClient from "@/api/query-client";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { NotFound } from "@/components/shared/not-found/not-found";
import { PlaylistCheckboxMenu } from "@/components/shared/playlist-checkbox-menu/playlist-checkbox-menu";
import { getDisplayedOwnerProfileRoute } from "@/utils/router.util";
import Input, { FormInput } from "@/components/shared/input/input";
import { FormTextArea } from "@/components/shared/text-area/text-area";
import { formatPlaylistForm } from "@/utils/playlist.util";
import { AnchorLink } from "@/components/shared";
import { faClock, faListOl } from "@fortawesome/free-solid-svg-icons";
import { TOOLTIP_DELAY_MS } from "@/constants/toast.constants";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@/components/shared/loader/loader";
import { useTheme } from "styled-components";
import styled from "styled-components";
import { Avatar } from "@/components/shared/avatar/avatar";
import { useImage } from "@/hooks/useImage";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { secondsToTimeFormat } from "@/utils/video.utils";
import { FilmstripGallery } from "@/components/shared/filmstrip-gallery/filmstrip-gallery";
import PermissionContext from "@/context/permission.context";
import { ApiResponse } from "@/types/api.types";
import { PlaylistItem } from "@/types/playlist.types";

const SectionID = "playlist";

const JumpToEndButton = styled.button<{ disabled?: boolean }>`
  display: inline-flex;
  width: fit-content;
  white-space: nowrap;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 0.875rem;
  font-family: inherit;
  color: ${(props) => props.theme.textPrimaryColor};
  background-color: transparent;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover:not([disabled]) {
    border-color: ${(props) => props.theme.colorPrimary};
    color: ${(props) => props.theme.colorPrimary};
  }
`;

const ScrollToTopButton = styled.button<{
  visible?: boolean;
  bottomOffset?: string;
}>`
  position: fixed;
  bottom: ${(props) => props.bottomOffset ?? "3.5rem"};
  right: 2rem;
  z-index: 1000;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: none;
  background-color: ${(props) => props.theme.colorPrimary};
  color: ${(props) => props.theme.black};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transform: ${(props) =>
    props.visible ? "translateY(0)" : "translateY(10px)"};
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    transform 0.3s ease,
    filter 0.3s ease,
    bottom 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    filter: brightness(140%);
    transform: ${(props) =>
      props.visible ? "translateY(-2px)" : "translateY(10px)"};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: ${(props) =>
      props.visible ? "translateY(0)" : "translateY(10px)"};
  }
`;

const FilmstripScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.5rem;
`;

const FilmstripRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: max-content;
`;

const FilmstripRow = styled.div`
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  width: max-content;
`;

/**
 * Playlist tabs handling
 */
type PlaylistTabs = "items" | "filmstrips" | "keyframes" | "appears_in";

const PLAYLIST_TABS: Record<Uppercase<PlaylistTabs>, PlaylistTabs> = {
  ITEMS: "items",
  FILMSTRIPS: "filmstrips",
  KEYFRAMES: "keyframes",
  APPEARS_IN: "appears_in",
} as const;

const PLAYLIST_TAB_LABELS: Record<Uppercase<PlaylistTabs>, string> = {
  ITEMS: "page.view_playlist.items",
  FILMSTRIPS: "page.view_playlist.filmstrips",
  KEYFRAMES: "page.view_playlist.keyframes",
  APPEARS_IN: "page.view_playlist.playlists",
};

const PlaylistTabBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0.5rem 0 0;
  flex-wrap: nowrap;
  overflow-x: auto;
`;

const PlaylistTab = styled.button<{ $active?: boolean }>`
  padding: 0.35rem 0.7rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(p) => (p.$active ? p.theme.colorPrimary : "transparent")};
  color: ${(p) =>
    p.$active ? p.theme.colorPrimary : "rgba(255,255,255,0.45)"};
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: ${(p) => (p.$active ? "600" : "400")};
  cursor: pointer;
  letter-spacing: 0.02em;
  margin-bottom: -1px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
  white-space: nowrap;

  @media (min-width: 640px) {
    padding: 0.55rem 1.25rem 0.7rem;
    font-size: 1rem;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.35rem;
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.6;
  vertical-align: middle;
`;

/**
 * View playlist page
 */
export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();

  const [radioGroupState, setRadioGroupState] = useState<
    PlaylistTabs | undefined
  >(PLAYLIST_TABS.ITEMS);
  const [showClientNotConnectedModal, setShowClientNotConnectedModal] =
    useState<boolean>(false);
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [playerTrayBottomOffset, setPlayerTrayBottomOffset] =
    useState<string>("3.5rem");
  const [removingPlaylistItemId, setRemovingPlaylistItemId] = useState<
    number | null
  >(null);

  const handleRadioButtonGroupChange = (value?: string) => {
    setRadioGroupState(value as PlaylistTabs);
    // Reset jump to end state when switching tabs
    setIsJumpingToEnd(false);
    setHasJumpedToEndItems(false);
    setHasJumpedToEndKeyframes(false);
  };

  const {
    isError,
    uuid,
    playlist,
    isPlaylistLoading,
    thumbnailUrl,
    usersOptions,
    isUsersLoading,
    isOwner,
    isUserAdmin,
    allowedEditPlaylist,
    allowedEditOwner,
    allowedEditVisibility,
    items,
    playlistKeyframes,
    playlistItemsTotalCount,
    playlistKeyframesTotalCount,
    fetchNextPlaylistItemsPage,
    hasNextPlaylistItemsPage,
    fetchNextPlaylistKeyframesPage,
    hasNextPlaylistKeyframesPage,
    setUserSearch,
    videos,
    setVideos,
    setIsUploadingFiles,
    setCurrentUploadFile,
    editMode,
    setEditMode,
    isThumbnailRemoved,
    setIsThumbnailRemoved,
    thumbnail,
    setTumbnail,
    showConfirmDeleteModal,
    setShowConfirmDeleteModal,
    totalVideos,
    isJumpingToEnd,
    setIsJumpingToEnd,
    hasJumpedToEndItems,
    setHasJumpedToEndItems,
    hasJumpedToEndKeyframes,
    setHasJumpedToEndKeyframes,
  } = usePlaylistState();
  const playlistReferences = playlist?.playlistItems ?? [];
  const { isAllowedTo } = useContext(PermissionContext);
  const { mutate: mutateDeletePlaylistReferenceItem } = useDeletePlaylistItem();

  const ownerAvatarUrl = useImage(playlist?.user?.avatar, {
    width: 142,
    fit: "cover",
  });
  const displayedOwnerAvatarUrl = useImage(
    playlist?.displayedOwner?.avatar ?? playlist?.user?.avatar,
    { width: 142, fit: "cover" },
  );

  const formMethods = useForm<UpdatePlaylistFormValues>({
    resolver: yupResolver(UpdatePlaylistSchema),
    defaultValues: { name: "", description: "" },
  });

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);
  const onHideClientNotConnectedModal = () =>
    setShowClientNotConnectedModal(false);

  const updateToast = (
    toastId: string | number,
    type: "success" | "error",
    message: string,
  ) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
    });
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScrollToEnd = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleJumpToEndClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const isJumpedToEnd =
      radioGroupState === "items"
        ? hasJumpedToEndItems
        : hasJumpedToEndKeyframes;

    const hasMorePages =
      radioGroupState === "items"
        ? hasNextPlaylistItemsPage
        : hasNextPlaylistKeyframesPage;

    if (isJumpedToEnd || !hasMorePages) {
      handleScrollToEnd();
    } else {
      if (radioGroupState === "items") {
        handleJumpToEndItems();
      } else {
        handleJumpToEndKeyframes();
      }
    }
  };

  const {
    isLoading,
    isLoadingDeletePlaylist,
    handleEdit,
    handleMutateThumbnailPlaylist,
    handleDeletePlaylistItem,
    handleDeleteKeyframe,
    handleOrderPlaylist,
    handleOrderPlaylistBy,
    handleUploadVideos,
    handleConfirmDeletePlaylist,
    handlePlayPlaylist,
    handleNavigateAddToPlaylist,
    handleNavigateAddKeyframeToPlaylist,
    handleJumpToEndItems,
    handleJumpToEndKeyframes,
  } = usePlaylistHandlers({
    uuid,
    playlist,
    items,
    thumbnail,
    isThumbnailRemoved,
    videos,
    reset: formMethods.reset,
    setEditMode,
    setCurrentUploadFile,
    setVideos,
    setIsUploadingFiles,
    onHideConfirmDeleteModal,
    fetchNextPlaylistItemsPage,
    hasNextPlaylistItemsPage,
    fetchNextPlaylistKeyframesPage,
    hasNextPlaylistKeyframesPage,
    playlistItemsTotalCount,
    playlistKeyframesTotalCount,
    playlistKeyframes,
    isJumpingToEnd,
    setIsJumpingToEnd,
    hasJumpedToEndItems,
    setHasJumpedToEndItems,
    hasJumpedToEndKeyframes,
    setHasJumpedToEndKeyframes,
  });

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    resetRemotePlaylistForm();
    setEditMode(false);
    setIsThumbnailRemoved(false);
    setTumbnail(undefined);
  };

  const handleRemovePlaylistFromPlaylist = useCallback(
    (playlistItemId: number, playlistUUID?: string) =>
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!playlistUUID || removingPlaylistItemId === playlistItemId) return;

        const toastId = toast.loading(
          t("page.view_playlist.removing_playlist_from_playlist"),
        );
        setRemovingPlaylistItemId(playlistItemId);

        mutateDeletePlaylistReferenceItem(
          { playlistUUID, itemId: playlistItemId },
          {
            onSuccess: (response) => {
              if (!response.success) {
                updateToast(
                  toastId,
                  "error",
                  response.message ??
                    t(
                      "page.view_playlist.error_removing_playlist_from_playlist",
                    ),
                );
                return;
              }

              queryClient.setQueryData<
                ApiResponse<{ references: PlaylistItem[]; count: number }>
              >([PLAYLIST_REFERENCES_QUERY_KEY, uuid], (oldData) => {
                if (!oldData?.data) return oldData;

                const references =
                  oldData.data.references?.filter(
                    (item) => item.id !== playlistItemId,
                  ) ?? [];

                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    references,
                    count: references.length,
                  },
                };
              });

              updateToast(
                toastId,
                "success",
                t("page.view_playlist.playlist_removed_from_playlist"),
              );
            },
            onError: () =>
              updateToast(
                toastId,
                "error",
                t("page.view_playlist.error_removing_playlist_from_playlist"),
              ),
            onSettled: () =>
              setRemovingPlaylistItemId((currentId) =>
                currentId === playlistItemId ? null : currentId,
              ),
          },
        );
      },
    [mutateDeletePlaylistReferenceItem, removingPlaylistItemId, t, uuid],
  );

  const handleRemoveThumbnail = () => {
    setIsThumbnailRemoved(true);
  };

  const handleThumbnailChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setTumbnail({ file: files, url: URL.createObjectURL(files) });
    }
    setIsThumbnailRemoved(false);
  };

  const onSubmit = async (data: UpdatePlaylistFormValues) => {
    try {
      if (totalVideos === 0) {
        setIsUploadingFiles(false);
      } else {
        setIsUploadingFiles(true);
        await handleUploadVideos();
      }
      await handleMutateThumbnailPlaylist(data);
    } catch {
      setIsUploadingFiles(false);
      toast.error(t("page.view_playlist.error_updating_playlist"));
    }
  };

  const renderPlaylistItemCard = useCallback(
    (playlistItem: PlaylistItem, index: number) => {
      const currentIndex = playlistItem.order;
      const isFirstItem = index === 0;
      const isLastItem = index === items.length - 1;

      return (
        <ItemCard
          key={playlistItem.id}
          draggable
          itemId={playlistItem.id}
          dndMode="local"
          size="sm"
          type={playlistItem.type}
          item={
            playlistItem.type === "dream"
              ? playlistItem.dreamItem
              : playlistItem.playlistItem
          }
          order={playlistItem.order}
          deleteDisabled={!allowedEditPlaylist}
          showPlayButton
          showOrderNumber
          indexNumber={index + 1}
          inline
          droppable
          onDelete={handleDeletePlaylistItem(playlistItem.id)}
          onOrder={handleOrderPlaylist}
          showReorderControls={allowedEditPlaylist}
          disableMoveToTop={!allowedEditPlaylist || isFirstItem}
          disableMoveUp={!allowedEditPlaylist || isFirstItem}
          disableMoveDown={!allowedEditPlaylist || isLastItem}
          disableMoveToBottom={!allowedEditPlaylist || isLastItem}
          onMoveToTop={() =>
            handleOrderPlaylist({
              id: playlistItem.id,
              currentIndex,
              newIndex: 0,
            })
          }
          onMoveUp={() =>
            handleOrderPlaylist({
              id: playlistItem.id,
              currentIndex,
              newIndex: currentIndex - 1,
            })
          }
          onMoveDown={() =>
            handleOrderPlaylist({
              id: playlistItem.id,
              currentIndex,
              newIndex: currentIndex + 1,
            })
          }
          onMoveToBottom={() =>
            handleOrderPlaylist({
              id: playlistItem.id,
              currentIndex,
              newIndex: items.length - 1,
            })
          }
        />
      );
    },
    [
      allowedEditPlaylist,
      handleDeletePlaylistItem,
      handleOrderPlaylist,
      items.length,
    ],
  );

  const resetRemotePlaylistForm = useCallback(() => {
    formMethods.reset(
      formatPlaylistForm({ playlist, isAdmin: isUserAdmin, t }),
    );
  }, [formMethods, playlist, isUserAdmin, t]);

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemotePlaylistForm();
  }, [formMethods, resetRemotePlaylistForm]);

  /**
   * Handle scroll-to-top button visibility
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkPlayerTray = () => {
      const trayElement = document.querySelector('[role="contentinfo"]');
      if (trayElement) {
        const rect = trayElement.getBoundingClientRect();
        const isVisible =
          rect.height > 0 &&
          rect.bottom > 0 &&
          window.innerHeight - rect.bottom < 200;

        if (isVisible) {
          const trayHeightPx = rect.height;
          const spacingRem = 2.5;
          const bottomOffsetPx = trayHeightPx + spacingRem * 16;
          const bottomOffsetRem = bottomOffsetPx / 16;
          setPlayerTrayBottomOffset(`${bottomOffsetRem}rem`);
        } else {
          setPlayerTrayBottomOffset("3.5rem");
        }
      } else {
        setPlayerTrayBottomOffset("3.5rem");
      }
    };

    checkPlayerTray();
    const interval = setInterval(checkPlayerTray, 100);
    const observer = new MutationObserver(checkPlayerTray);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  /**
   * Handles automatic scrolling when navigation comes from a virtual playlist
   */
  useEffect(() => {
    // Extract the target element UUID from the URL hash
    const targetElementUUID = location.hash.replace("#", "");

    // Only attempt to scroll after loading is complete and if we have a target
    // We need to wait when request is completed, since the component will not be rendered initially
    if (!isPlaylistLoading && targetElementUUID) {
      // Use data attribute for more reliable selection
      const targetElement = document.querySelector(
        `[data-element-uuid="${targetElementUUID}"]`,
      );

      if (targetElement) {
        // Scroll to the element
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isPlaylistLoading, location]);

  if (!uuid) return <Navigate to={ROUTES.ROOT} replace />;

  /**
   * Return error if query has an error
   */
  if (isError) return <NotFound />;

  if (isPlaylistLoading || !playlist) {
    return (
      <Container>
        <Row justifyContent="center">
          <Spinner />
        </Row>
      </Container>
    );
  }

  return (
    <>
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onCancel={onHideConfirmDeleteModal}
        onConfirm={handleConfirmDeletePlaylist}
        isConfirming={isLoadingDeletePlaylist}
        title={t("page.view_playlist.confirm_delete_modal_title")}
        text={
          <Text>
            {t("page.view_playlist.confirm_delete_modal_body")}{" "}
            <em>
              <strong>{playlist?.name}</strong>
            </em>
          </Text>
        }
      />

      <ConfirmModal
        isOpen={showClientNotConnectedModal}
        onCancel={onHideClientNotConnectedModal}
        onConfirm={onHideClientNotConnectedModal}
        title={t("page.view_dream.client_not_connected_modal_title")}
        confirmText={t("page.view_dream.client_not_connected_modal_ok")}
        cancelText=""
        text={
          <Text>
            Start the app for the remote control, and try again.
            <br />
            <br />
            <AnchorLink to={ROUTES.INSTALL} type="primary">
              Install
            </AnchorLink>{" "}
            it first if needed.
            <br />
            <br />
            You can also play with the{" "}
            <AnchorLink to={ROUTES.REMOTE_CONTROL} type="primary">
              web client
            </AnchorLink>
            .
          </Text>
        }
      />
      <Container>
        <Section id={SectionID}>
          <Row
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            pb={[2, 2, "1rem"]}
            separator
          >
            <Column flex={["1 1 200px", "1", "1"]}>
              <h2 style={{ margin: 0 }}>{t("page.view_playlist.title")}</h2>
            </Column>

            <Column flex="1" alignSelf="flex-end" alignItems="flex-end">
              <Row marginBottom={0} alignItems="center">
                <PlaylistCheckboxMenu type="playlist" targetItem={playlist} />
                <Button
                  type="button"
                  buttonType="default"
                  transparent
                  style={{ width: "3rem", padding: "4px" }}
                  onClick={handlePlayPlaylist}
                  data-tooltip-id="play-playlist"
                >
                  <Tooltip
                    id="play-playlist"
                    place="bottom"
                    delayShow={TOOLTIP_DELAY_MS}
                    content={t("page.view_playlist.play_playlist")}
                  />
                  <PlaylistPlay width={"1.6em"} height={"1.6em"} />
                </Button>
                {!editMode && (
                  <Restricted
                    to={PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST}
                    isOwner={isOwner}
                  >
                    <Button
                      type="button"
                      buttonType="danger"
                      transparent
                      style={{ width: "3rem" }}
                      onClick={onShowConfirmDeleteModal}
                      data-tooltip-id="playlist-delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Tooltip
                      id="playlist-delete"
                      place="bottom"
                      delayShow={TOOLTIP_DELAY_MS}
                      content={t("page.view_playlist.delete_playlist_tooltip")}
                    />
                  </Restricted>
                )}
              </Row>
            </Column>
          </Row>

          <FormProvider {...formMethods}>
            <form
              style={{ minWidth: "320px" }}
              onSubmit={formMethods.handleSubmit(onSubmit)}
            >
              <Row justifyContent="space-between">
                <span />
                <div>
                  {editMode ? (
                    <>
                      <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        {t("page.view_playlist.cancel")}
                      </Button>

                      <Button
                        type="submit"
                        after={<FontAwesomeIcon icon={faSave} />}
                        isLoading={isLoading}
                        ml="1rem"
                      >
                        {isLoading
                          ? t("page.view_playlist.saving")
                          : t("page.view_playlist.save")}
                      </Button>
                    </>
                  ) : (
                    <Restricted
                      to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
                      isOwner={isOwner}
                    >
                      <Button
                        type="button"
                        after={<FontAwesomeIcon icon={faSave} />}
                        onClick={handleEdit}
                      >
                        {t("page.view_playlist.edit")}
                      </Button>
                    </Restricted>
                  )}
                </div>
              </Row>
              <Row flexWrap="wrap">
                <Column
                  mr={[0, 2, 2]}
                  mb={[4, 4, 0]}
                  flex={["1 1 320px", "1", "1"]}
                >
                  <ThumbnailInput
                    thumbnail={thumbnailUrl}
                    localMultimedia={thumbnail}
                    editMode={editMode}
                    isRemoved={isThumbnailRemoved}
                    handleChange={handleThumbnailChange}
                    handleRemove={handleRemoveThumbnail}
                  />
                </Column>
                <Column ml={[0, 2, 2]} flex={["1 1 320px", "1", "1"]}>
                  {
                    // Show only for owners when playlist is hidden
                    isOwner && playlist.hidden && (
                      <Input
                        disabled
                        outlined
                        type="text"
                        placeholder={t("page.view_playlist.visibility")}
                        before={<FontAwesomeIcon icon={faEye} />}
                        value={t("playlist.hidden.hidden")}
                        name="visibility-for-owner"
                      />
                    )
                  }
                  <FormInput
                    disabled={!editMode}
                    placeholder={t("page.view_playlist.name")}
                    type="text"
                    before={<FontAwesomeIcon icon={faFileVideo} />}
                    {...formMethods.register("name")}
                  />

                  <Restricted
                    to={PLAYLIST_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
                    isOwner={user?.id === playlist?.user?.id}
                  >
                    <FormInput
                      disabled
                      placeholder={t("page.view_playlist.owner")}
                      type="text"
                      before={<FontAwesomeIcon icon={faSave} />}
                      after={
                        playlist?.user?.uuid ? (
                          <AnchorLink
                            type="secondary"
                            to={`${ROUTES.PROFILE}/${playlist.user.uuid}`}
                          >
                            <Avatar size="xs" url={ownerAvatarUrl} />
                          </AnchorLink>
                        ) : (
                          <Avatar size="xs" url={ownerAvatarUrl} />
                        )
                      }
                      to={`${ROUTES.PROFILE}/${playlist?.user.uuid}`}
                      {...formMethods.register("user")}
                    />
                  </Restricted>

                  <FormInput
                    disabled
                    placeholder={t("page.view_playlist.created")}
                    type="text"
                    before={<FontAwesomeIcon icon={faCalendar} />}
                    {...formMethods.register("created_at")}
                  />

                  <Input
                    disabled
                    type="text"
                    placeholder="Dream Count"
                    before={<FontAwesomeIcon icon={faListOl} />}
                    value={
                      items.length > 0 || playlistItemsTotalCount > 0
                        ? playlistItemsTotalCount.toString()
                        : typeof playlist?.totalDreamCount === "number"
                          ? playlist.totalDreamCount.toString()
                          : "0"
                    }
                    name="dream-count"
                  />

                  <Input
                    disabled
                    type="text"
                    placeholder="Total Duration"
                    before={<FontAwesomeIcon icon={faClock} />}
                    value={
                      typeof playlist?.totalDurationSeconds === "number"
                        ? secondsToTimeFormat(playlist.totalDurationSeconds)
                        : ""
                    }
                    name="total-duration"
                  />

                  <Restricted
                    to={PLAYLIST_PERMISSIONS.CAN_VIEW_NSFW}
                    isOwner={isOwner}
                  >
                    <Controller
                      name="nsfw"
                      control={formMethods.control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isDisabled={!editMode || !allowedEditOwner}
                          placeholder={t("page.view_playlist.nsfw")}
                          before={<FontAwesomeIcon icon={faShield} />}
                          options={getNsfwOptions(t)}
                        />
                      )}
                    />
                  </Restricted>
                </Column>
              </Row>
              <Row flex="auto" m={0}>
                <Column flex="auto" m={0}>
                  <FormTextArea
                    linkify
                    disabled={!editMode}
                    placeholder={t("page.view_playlist.description")}
                    before={<FontAwesomeIcon icon={faAlignLeft} />}
                    {...formMethods.register("description")}
                  />
                </Column>
              </Row>
              <Row flex="auto" m={0}>
                <Column flex="auto" m={0}>
                  <Row flexWrap="wrap">
                    <Column
                      flex={["1 1 33.33%", "1 1 33.33%", "1 1 33.33%"]}
                      pr={[1, 1, 1]}
                    >
                      <Controller
                        name="displayedOwner"
                        control={formMethods.control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder={
                              isUserAdmin
                                ? t("page.view_dream.displayed_owner")
                                : t("page.view_dream.owner")
                            }
                            isDisabled={!editMode || !allowedEditOwner}
                            isLoading={isUsersLoading}
                            before={<FontAwesomeIcon icon={faUser} />}
                            after={(() => {
                              const route = getDisplayedOwnerProfileRoute(
                                isUserAdmin,
                                playlist?.user,
                                playlist?.displayedOwner,
                              );
                              if (!route) return undefined;
                              return (
                                <AnchorLink type="secondary" to={route}>
                                  <Avatar
                                    size="xs"
                                    url={displayedOwnerAvatarUrl}
                                  />
                                </AnchorLink>
                              );
                            })()}
                            to={getDisplayedOwnerProfileRoute(
                              isUserAdmin,
                              playlist?.user,
                              playlist?.displayedOwner,
                            )}
                            options={usersOptions}
                            onInputChange={(newValue) =>
                              setUserSearch(newValue)
                            }
                          />
                        )}
                      />
                    </Column>
                    <Column
                      flex={["1 1 33.33%", "1 1 33.33%", "1 1 33.33%"]}
                      px={[1, 1, 1]}
                    >
                      <Restricted
                        to={PLAYLIST_PERMISSIONS.CAN_VIEW_FEATURE_RANK}
                      >
                        <FormInput
                          disabled={!editMode}
                          placeholder={t("page.view_playlist.feature_rank")}
                          type="text"
                          before={<FontAwesomeIcon icon={faRankingStar} />}
                          {...formMethods.register("featureRank")}
                        />
                      </Restricted>
                    </Column>
                    <Column
                      flex={["1 1 33.33%", "1 1 33.33%", "1 1 33.33%"]}
                      px={[1, 1, 1]}
                    >
                      <FormInput
                        disabled={!editMode}
                        placeholder={t("page.view_playlist.loops")}
                        type="number"
                        before={<FontAwesomeIcon icon={faRepeat} />}
                        {...formMethods.register("loops")}
                      />
                    </Column>
                    <Column
                      flex={["1 1 33.33%", "1 1 33.33%", "1 1 33.33%"]}
                      pl={[1, 1, 1]}
                    >
                      {/* if user is admin, then show editable hidden field */}
                      <Restricted to={PLAYLIST_PERMISSIONS.CAN_VIEW_VISIBILITY}>
                        <Controller
                          name="hidden"
                          control={formMethods.control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              isDisabled={!editMode || !allowedEditVisibility}
                              placeholder={t("page.view_playlist.visibility")}
                              before={<FontAwesomeIcon icon={faEye} />}
                              options={getHiddenOptions(t)}
                            />
                          )}
                        />
                      </Restricted>
                    </Column>
                  </Row>
                </Column>
              </Row>
              {/* Row 1: tabs centered */}
              <Row mb={0}>
                <PlaylistTabBar>
                  {(
                    [
                      PLAYLIST_TABS.ITEMS,
                      PLAYLIST_TABS.FILMSTRIPS,
                      PLAYLIST_TABS.KEYFRAMES,
                      PLAYLIST_TABS.APPEARS_IN,
                    ] as PlaylistTabs[]
                  ).map((tab) => {
                    const countMap: Partial<Record<PlaylistTabs, number>> = {
                      items: playlistItemsTotalCount,
                      keyframes: playlistKeyframesTotalCount,
                      appears_in: playlistReferences.length,
                    };
                    const count = countMap[tab];
                    return (
                      <PlaylistTab
                        key={tab}
                        type="button"
                        $active={radioGroupState === tab}
                        onClick={() => handleRadioButtonGroupChange(tab)}
                      >
                        {t(
                          PLAYLIST_TAB_LABELS[
                            tab.toUpperCase() as Uppercase<PlaylistTabs>
                          ],
                        )}
                        {count !== undefined && count > 0 && (
                          <TabBadge>{count}</TabBadge>
                        )}
                      </PlaylistTab>
                    );
                  })}
                </PlaylistTabBar>
              </Row>
              {/* Row 2: controls space-between */}
              <Row
                justifyContent="space-between"
                alignItems="center"
                mt="0.4rem"
                mb={3}
              >
                {(radioGroupState === "items" ||
                  radioGroupState === "keyframes") && (
                  <JumpToEndButton
                    type="button"
                    onClick={handleJumpToEndClick}
                    disabled={
                      isJumpingToEnd ||
                      (radioGroupState === "items"
                        ? !hasNextPlaylistItemsPage && items.length === 0
                        : !hasNextPlaylistKeyframesPage &&
                          playlistKeyframes.length === 0)
                    }
                  >
                    {isJumpingToEnd ? "Jumping..." : "Jump to End"}
                  </JumpToEndButton>
                )}
                <Restricted
                  to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
                  isOwner={user?.id === playlist?.user?.id}
                >
                  <Column>
                    {radioGroupState === "items" && (
                      <>
                        <Row mb={2} justifyContent="flex-end">
                          <Text>{t("page.view_playlist.sort_by")}</Text>
                        </Row>
                        <Row mb={0}>
                          <Column mr="2">
                            <Button
                              type="button"
                              buttonType="default"
                              transparent
                              ml="1rem"
                              onClick={handleNavigateAddToPlaylist}
                              data-tooltip-id="add-dreams"
                            >
                              <Tooltip
                                id="add-dreams"
                                place="right-end"
                                content={t(
                                  "page.view_playlist.add_dreams_to_playlist",
                                )}
                              />
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                          </Column>
                          <Column>
                            <Row alignItems="center" flex="auto" mb="0">
                              <Button
                                type="button"
                                size="sm"
                                buttonType="tertiary"
                                mr={2}
                                onClick={handleOrderPlaylistBy("name")}
                              >
                                {t("page.view_playlist.name")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                buttonType="tertiary"
                                onClick={handleOrderPlaylistBy("date")}
                              >
                                {t("page.view_playlist.date")}
                              </Button>
                            </Row>
                          </Column>
                        </Row>
                      </>
                    )}
                    {radioGroupState === "keyframes" && (
                      <Row mb={0}>
                        <Column mr="2">
                          <Button
                            type="button"
                            buttonType="default"
                            transparent
                            ml="1rem"
                            onClick={handleNavigateAddKeyframeToPlaylist}
                            data-tooltip-id="add-keyframes"
                          >
                            <Tooltip
                              id="add-keyframes"
                              place="right-end"
                              content={t(
                                "page.view_playlist.add_keyframes_to_playlist",
                              )}
                            />
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </Column>
                      </Row>
                    )}
                  </Column>
                </Restricted>
              </Row>
              {
                // if items are selected, show item cardlist and data
                radioGroupState === "items" && (
                  <Row style={{ display: "block" }}>
                    {items.length ? (
                      hasJumpedToEndItems || isJumpingToEnd ? (
                        // When jumped to end or jumping, render without InfiniteScroll
                        <>
                          {isJumpingToEnd ? (
                            <Row justifyContent="center" mt="2rem">
                              <Spinner />
                              <Text color={theme.textPrimaryColor} ml="1rem">
                                Loading all items...
                              </Text>
                            </Row>
                          ) : (
                            <>
                              <ItemCardList>
                                {items.map(renderPlaylistItemCard)}
                              </ItemCardList>
                              <Row justifyContent="center" mt="2rem">
                                <Text color={theme.textPrimaryColor}>
                                  {t("components.infinite_scroll.end_message")}
                                </Text>
                              </Row>
                            </>
                          )}
                        </>
                      ) : (
                        // Normal infinite scroll behavior
                        <InfiniteScroll
                          dataLength={items.length}
                          next={fetchNextPlaylistItemsPage}
                          hasMore={hasNextPlaylistItemsPage ?? false}
                          loader={<Loader />}
                          endMessage={
                            !isPlaylistLoading && (
                              <Row justifyContent="center" mt="2rem">
                                <Text color={theme.textPrimaryColor}>
                                  {t("components.infinite_scroll.end_message")}
                                </Text>
                              </Row>
                            )
                          }
                        >
                          <ItemCardList>
                            {items.map(renderPlaylistItemCard)}
                          </ItemCardList>
                        </InfiniteScroll>
                      )
                    ) : (
                      <Text mb={4}>
                        {t("page.view_playlist.empty_playlist")}
                      </Text>
                    )}
                  </Row>
                )
              }
              {radioGroupState === "keyframes" && (
                <Row style={{ display: "block" }}>
                  {playlistKeyframes.length ? (
                    hasJumpedToEndKeyframes || isJumpingToEnd ? (
                      <>
                        {isJumpingToEnd ? (
                          <Row justifyContent="center" mt="2rem">
                            <Spinner />
                            <Text color={theme.textPrimaryColor} ml="1rem">
                              Loading all keyframes...
                            </Text>
                          </Row>
                        ) : (
                          <>
                            <ItemCardList>
                              {playlistKeyframes.map((k, index) => (
                                <ItemCard
                                  key={k.id}
                                  draggable
                                  itemId={k.id}
                                  dndMode="local"
                                  size="sm"
                                  type="keyframe"
                                  item={k.keyframe}
                                  order={k.order}
                                  deleteDisabled={!allowedEditPlaylist}
                                  showOrderNumber
                                  indexNumber={index + 1}
                                  inline
                                  onDelete={handleDeleteKeyframe(k.id)}
                                />
                              ))}
                            </ItemCardList>
                            <Row justifyContent="center" mt="2rem">
                              <Text color={theme.textPrimaryColor}>
                                {t("components.infinite_scroll.end_message")}
                              </Text>
                            </Row>
                          </>
                        )}
                      </>
                    ) : (
                      // Normal infinite scroll behavior
                      <InfiniteScroll
                        dataLength={playlistKeyframes.length}
                        next={fetchNextPlaylistKeyframesPage}
                        hasMore={hasNextPlaylistKeyframesPage ?? false}
                        loader={<Loader />}
                        endMessage={
                          !isPlaylistLoading && (
                            <Row justifyContent="center" mt="2rem">
                              <Text color={theme.textPrimaryColor}>
                                {t("components.infinite_scroll.end_message")}
                              </Text>
                            </Row>
                          )
                        }
                      >
                        <ItemCardList>
                          {playlistKeyframes.map((k, index) => (
                            <ItemCard
                              key={k.id}
                              draggable
                              itemId={k.id}
                              dndMode="local"
                              size="sm"
                              type="keyframe"
                              item={k.keyframe}
                              order={k.order}
                              deleteDisabled={!allowedEditPlaylist}
                              showOrderNumber
                              indexNumber={index + 1}
                              inline
                              onDelete={handleDeleteKeyframe(k.id)}
                            />
                          ))}
                        </ItemCardList>
                      </InfiniteScroll>
                    )
                  ) : (
                    <Text mb={4}>{t("page.view_playlist.empty_playlist")}</Text>
                  )}
                </Row>
              )}
              {radioGroupState === "filmstrips" && (
                <Row style={{ display: "block" }}>
                  {items.some((item) => item.type === "dream") ? (
                    <InfiniteScroll
                      dataLength={items.length}
                      next={fetchNextPlaylistItemsPage}
                      hasMore={hasNextPlaylistItemsPage ?? false}
                      loader={<Loader />}
                      endMessage={
                        !isPlaylistLoading && (
                          <Row justifyContent="center" mt="2rem">
                            <Text color={theme.textPrimaryColor}>
                              {t("components.infinite_scroll.end_message")}
                            </Text>
                          </Row>
                        )
                      }
                    >
                      <FilmstripScrollContainer>
                        <FilmstripRows>
                          {items
                            .filter(
                              (item) => item.type === "dream" && item.dreamItem,
                            )
                            .map((item) => (
                              <FilmstripRow key={item.id}>
                                <FilmstripGallery
                                  dream={item.dreamItem}
                                  frameWidth={180}
                                />
                              </FilmstripRow>
                            ))}
                        </FilmstripRows>
                      </FilmstripScrollContainer>
                    </InfiniteScroll>
                  ) : (
                    <Text mb={4}>{t("page.view_playlist.empty_playlist")}</Text>
                  )}
                </Row>
              )}
              {radioGroupState === "appears_in" && (
                <Row flex="auto">
                  <ItemCardList>
                    {playlistReferences.length === 0 ? (
                      <Text mb={4}>
                        {t("page.view_playlist.empty_playlist")}
                      </Text>
                    ) : (
                      playlistReferences.map((pi) => {
                        const playlistUUID = pi.playlist?.uuid;
                        const playlistOwnerId = pi.playlist?.user?.id;
                        const isPlaylistOwner = Boolean(
                          playlistOwnerId && user?.id === playlistOwnerId,
                        );
                        const canRemoveFromPlaylist =
                          Boolean(playlistUUID) &&
                          isAllowedTo({
                            permission:
                              PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST,
                            isOwner: isPlaylistOwner,
                          });
                        const tooltipId = canRemoveFromPlaylist
                          ? `remove-playlist-from-playlist-${pi.id}`
                          : undefined;

                        return (
                          <Fragment key={pi.id}>
                            <ItemCard
                              type="playlist"
                              item={pi.playlist}
                              inline
                              size="sm"
                              onDelete={
                                canRemoveFromPlaylist
                                  ? (e: React.MouseEvent) =>
                                      handleRemovePlaylistFromPlaylist(
                                        pi.id,
                                        playlistUUID,
                                      )(e)
                                  : undefined
                              }
                              deleteDisabled={
                                !canRemoveFromPlaylist ||
                                removingPlaylistItemId === pi.id
                              }
                              deleteTooltipId={tooltipId}
                            />
                            {tooltipId && (
                              <Tooltip
                                id={tooltipId}
                                place="top"
                                delayShow={TOOLTIP_DELAY_MS}
                                content={t(
                                  "page.view_playlist.remove_playlist_from_playlist_tooltip",
                                )}
                              />
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </ItemCardList>
                </Row>
              )}

              {/* Removing add item playlist dropzone, probably next to be deprecated  */}
              {/* <Restricted
              to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
              isOwner={user?.id === playlist?.user?.id}
            >
              <Row>
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontStyle: "italic",
                  }}
                >
                  {t("page.view_playlist.add_item")}
                </Text>
              </Row>
              <Row>
                <AddItemPlaylistDropzone show uuid={playlist?.uuid} />
              </Row>
            </Restricted> */}
            </form>
          </FormProvider>
        </Section>
      </Container>

      <ScrollToTopButton
        visible={showScrollToTop}
        bottomOffset={playerTrayBottomOffset}
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
      >
        <FontAwesomeIcon icon={faChevronUp} />
      </ScrollToTopButton>
    </>
  );
};

export default ViewPlaylistPage;
