import { yupResolver } from "@hookform/resolvers/yup";
import { Button, ItemCardList, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { useCallback, useEffect, useState } from "react";
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
import {
  faAlignLeft,
  faCalendar,
  faEye,
  faFileVideo,
  faPlay,
  faPlus,
  faRankingStar,
  faSave,
  faShield,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "@/components/shared/select/select";
import { getHiddenOptions, getNsfwOptions } from "@/constants/select.constants";
import { usePlaylistState } from "./usePlaylistState";
import { usePlaylistHandlers } from "./usePlaylistHandlers";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { NotFound } from "@/components/shared/not-found/not-found";
import { PlaylistCheckboxMenu } from "@/components/shared/playlist-checkbox-menu/playlist-checkbox-menu";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import { TFunction } from "i18next";
import { getDisplayedOwnerProfileRoute } from "@/utils/router.util";
import Input, { FormInput } from "@/components/shared/input/input";
import { FormTextArea } from "@/components/shared/text-area/text-area";
import {
  formatPlaylistForm,
  countDreamsInPlaylist,
  getPlaylistTotalDurationFormatted,
} from "@/utils/playlist.util";
import { AnchorLink } from "@/components/shared";
import { faClock, faListOl } from "@fortawesome/free-solid-svg-icons";

const SectionID = "playlist";

/**
 * Playlist tabs handling
 */
type PlaylistTabs = "items" | "keyframes";

const PLAYLIST_TABS: Record<Uppercase<PlaylistTabs>, PlaylistTabs> = {
  ITEMS: "items",
  KEYFRAMES: "keyframes",
} as const;

const FEED_FILTERS_NAMES: Record<Uppercase<PlaylistTabs>, string> = {
  ITEMS: "page.view_playlist.items",
  KEYFRAMES: "page.view_playlist.keyframes",
};

const getPlaylistTabsFilterData: (
  t: TFunction,
) => Array<{ key: string; value: string }> = (t) => {
  return [
    { key: t(FEED_FILTERS_NAMES.ITEMS), value: PLAYLIST_TABS.ITEMS.toString() },
    {
      key: t(FEED_FILTERS_NAMES.KEYFRAMES),
      value: PLAYLIST_TABS.KEYFRAMES.toString(),
    },
  ];
};

/**
 * View playlist page
 */
export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const [radioGroupState, setRadioGroupState] = useState<
    PlaylistTabs | undefined
  >(PLAYLIST_TABS.ITEMS);
  const [showClientNotConnectedModal, setShowClientNotConnectedModal] =
    useState<boolean>(false);

  const handleRadioButtonGroupChange = (value?: string) => {
    setRadioGroupState(value as PlaylistTabs);
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
  } = usePlaylistState();

  const formMethods = useForm<UpdatePlaylistFormValues>({
    resolver: yupResolver(UpdatePlaylistSchema),
    defaultValues: { name: "", description: "" },
  });

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);
  const onShowClientNotConnectedModal = () =>
    setShowClientNotConnectedModal(true);
  const onHideClientNotConnectedModal = () =>
    setShowClientNotConnectedModal(false);

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
    onShowClientNotConnectedModal,
  });

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    resetRemotePlaylistForm();
    setEditMode(false);
    setIsThumbnailRemoved(false);
    setTumbnail(undefined);
  };

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
    } catch (error) {
      setIsUploadingFiles(false);
      toast.error(t("page.view_playlist.error_updating_playlist"));
    }
  };

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
                  style={{ width: "3rem" }}
                  onClick={handlePlayPlaylist}
                >
                  <span className="fa-stack">
                    <FontAwesomeIcon icon={faPlay} />
                    <FontAwesomeIcon
                      icon={faPlay}
                      style={{ transform: "translate(-30%, 0%)" }}
                    />
                  </span>
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
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
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
                    value={countDreamsInPlaylist(items).toString()}
                    name="dream-count"
                  />

                  <Input
                    disabled
                    type="text"
                    placeholder="Total Duration"
                    before={<FontAwesomeIcon icon={faClock} />}
                    value={getPlaylistTotalDurationFormatted(items)}
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
                      pl={[1, 1, 1]}
                    >
                      {/* if user is admin, show editable hidden field */}
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
              <Row justifyContent="space-between" alignItems="center">
                <Column>
                  <RadioButtonGroup
                    name="search-filter"
                    value={radioGroupState as string}
                    data={getPlaylistTabsFilterData(t)}
                    onChange={handleRadioButtonGroupChange}
                  />
                </Column>
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
                      <>
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
                      </>
                    )}
                  </Column>
                </Restricted>
              </Row>
              {
                // if items are selected, show item cardlist and data
                radioGroupState === "items" && (
                  <Row flex="auto">
                    {items.length ? (
                      <ItemCardList>
                        {items.map((i) => (
                          <ItemCard
                            key={i.id}
                            draggable
                            itemId={i.id}
                            dndMode="local"
                            size="sm"
                            type={i.type}
                            item={
                              i.type === "dream" ? i.dreamItem : i.playlistItem
                            }
                            order={i.order}
                            deleteDisabled={!allowedEditPlaylist}
                            showPlayButton
                            inline
                            droppable
                            onDelete={handleDeletePlaylistItem(i.id)}
                            onOrder={handleOrderPlaylist}
                          />
                        ))}
                      </ItemCardList>
                    ) : (
                      <Text mb={4}>
                        {t("page.view_playlist.empty_playlist")}
                      </Text>
                    )}
                  </Row>
                )
              }
              {
                // if items are selected, show item cardlist and data
                radioGroupState === "keyframes" && (
                  <Row flex="auto">
                    {playlistKeyframes.length ? (
                      <ItemCardList>
                        {playlistKeyframes.map((k) => (
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
                            inline
                            onDelete={handleDeleteKeyframe(k.id)}
                          />
                        ))}
                      </ItemCardList>
                    ) : (
                      <Text mb={4}>
                        {t("page.view_playlist.empty_playlist")}
                      </Text>
                    )}
                  </Row>
                )
              }

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
    </>
  );
};

export default ViewPlaylistPage;
