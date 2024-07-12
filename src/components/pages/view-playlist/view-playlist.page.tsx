import { yupResolver } from "@hookform/resolvers/yup";
import {
  AddItemPlaylistDropzone,
  Button,
  Input,
  ItemCardList,
  FileUploader,
  Row,
} from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { FORMAT } from "@/constants/moment.constants";
import moment from "moment";
import { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
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
  faCalendar,
  faFileVideo,
  faPlay,
  faRankingStar,
  faSave,
  faShield,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";
import { Select } from "@/components/shared/select/select";
import { filterNsfwOption, getNsfwOptions } from "@/constants/dream.constants";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import { usePlaylistState } from "./usePlaylistState";
import { usePlaylistHandlers } from "./usePlaylistHandlers";
import { VideoList } from "@/components/shared/video-list/video-list";
import { UploadVideosProgress } from "@/components/shared/upload-videos-progress/upload-videos-progress";
import { toast } from "react-toastify";

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    playlistId,
    playlist,
    isPlaylistLoading,
    thumbnailUrl,
    usersOptions,
    isUsersLoading,
    isOwner,
    isUserAdmin,
    allowedEditPlaylist,
    allowedEditOwner,
    items,
    setUserSearch,
    videos,
    setVideos,
    isUploadingFiles,
    setIsUploadingFiles,
    currentUploadFile,
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
    totalUploadedVideos,
    totalUploadedVideosPercentage,
  } = usePlaylistState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    control,
  } = useForm<UpdatePlaylistFormValues>({
    resolver: yupResolver(UpdatePlaylistSchema),
    defaultValues: { name: "" },
  });

  const values = getValues();

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

  const {
    isLoading,
    uploadProgress,
    isLoadingDeletePlaylist,
    handleEdit,
    handleMutateThumbnailPlaylist,
    handleDeletePlaylistItem,
    handleOrderPlaylist,
    handleOrderPlaylistBy,
    handleFileUploaderChange,
    handleUploadVideos,
    handleDeleteVideo,
    handleConfirmDeletePlaylist,
    handlePlayPlaylist,
  } = usePlaylistHandlers({
    playlistId,
    playlist,
    items,
    thumbnail,
    isThumbnailRemoved,
    videos,
    reset,
    setEditMode,
    setCurrentUploadFile,
    setVideos,
    setIsUploadingFiles,
    onHideConfirmDeleteModal,
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
    reset({
      name: playlist?.name,
      user: playlist?.user?.name,
      /**
       * set displayedOwner
       * for admins always show displayedOwner
       * for normal users show displayedOwner, if doesn't exists, show user
       */
      displayedOwner: isUserAdmin
        ? {
            value: playlist?.displayedOwner?.id,
            label: getUserName(playlist?.displayedOwner),
          }
        : {
            value: playlist?.displayedOwner?.id ?? playlist?.user?.id,
            label: getUserName(playlist?.displayedOwner ?? playlist?.user),
          },
      featureRank: playlist?.featureRank,
      nsfw: filterNsfwOption(playlist?.nsfw, t),
      created_at: moment(playlist?.created_at).format(FORMAT),
    });
  }, [reset, playlist, isUserAdmin, t]);

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemotePlaylistForm();
  }, [reset, resetRemotePlaylistForm]);

  if (!playlistId) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  if (isPlaylistLoading) {
    return (
      <Row justifyContent="center">
        <Spinner />
      </Row>
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
      <Section id={SectionID}>
        <Container>
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
              <Row marginBottom={0}>
                <Button
                  type="button"
                  buttonType="default"
                  transparent
                  ml="1rem"
                  onClick={handlePlayPlaylist}
                >
                  <FontAwesomeIcon icon={faPlay} />
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
                      ml="1rem"
                      onClick={onShowConfirmDeleteModal}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Restricted>
                )}
              </Row>
            </Column>
          </Row>
          <form style={{ minWidth: "320px" }} onSubmit={handleSubmit(onSubmit)}>
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
                  types={["JPG", "JPEG"]}
                />
              </Column>
              <Column ml={[0, 2, 2]} flex={["1 1 320px", "1", "1"]}>
                <Input
                  disabled={!editMode}
                  placeholder={t("page.view_playlist.name")}
                  type="text"
                  before={<FontAwesomeIcon icon={faFileVideo} />}
                  error={errors.name?.message}
                  value={values.name}
                  {...register("name")}
                />
                <Restricted to={PLAYLIST_PERMISSIONS.CAN_VIEW_FEATURE_RANK}>
                  <Input
                    disabled={!editMode}
                    placeholder={t("page.view_playlist.feature_rank")}
                    type="text"
                    before={<FontAwesomeIcon icon={faRankingStar} />}
                    error={errors.featureRank?.message}
                    value={values.featureRank}
                    {...register("featureRank")}
                  />
                </Restricted>

                <Restricted
                  to={PLAYLIST_PERMISSIONS.CAN_VIEW_NSFW}
                  isOwner={isOwner}
                >
                  <Controller
                    name="nsfw"
                    control={control}
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

                <Restricted
                  to={PLAYLIST_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
                  isOwner={user?.id === playlist?.user?.id}
                >
                  <Input
                    disabled
                    placeholder={t("page.view_playlist.owner")}
                    type="text"
                    before={<FontAwesomeIcon icon={faSave} />}
                    value={values.user}
                    anchor={() =>
                      navigate(`${ROUTES.PROFILE}/${playlist?.user.id ?? 0}`)
                    }
                    {...register("user")}
                  />
                </Restricted>

                <Controller
                  name="displayedOwner"
                  control={control}
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
                      anchor={() =>
                        navigate(`${ROUTES.PROFILE}/${playlist?.user.id ?? 0}`)
                      }
                      options={usersOptions}
                      onInputChange={(newValue) => setUserSearch(newValue)}
                    />
                  )}
                />

                <Input
                  disabled
                  placeholder={t("page.view_playlist.created")}
                  type="text"
                  before={<FontAwesomeIcon icon={faCalendar} />}
                  value={values.created_at}
                  {...register("created_at")}
                />
              </Column>
            </Row>
            <Row justifyContent="space-between" alignItems="center">
              <h3>{t("page.view_playlist.items")}</h3>
              <Restricted
                to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
                isOwner={user?.id === playlist?.user?.id}
              >
                <Column>
                  <Row mb={2} justifyContent="flex-end">
                    <Text>{t("page.view_playlist.sort_by")}</Text>
                  </Row>

                  <Row mb={0}>
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
              </Restricted>
            </Row>
            <Row flex="auto">
              {items.length ? (
                <ItemCardList>
                  {items.map((i) => (
                    <ItemCard
                      key={i.id}
                      itemId={i.id}
                      dndMode="local"
                      size="sm"
                      type={i.type}
                      item={i.type === "dream" ? i.dreamItem : i.playlistItem}
                      order={i.order}
                      deleteDisabled={!allowedEditPlaylist}
                      showPlayButton
                      inline
                      onDelete={handleDeletePlaylistItem(i.id)}
                      onOrder={handleOrderPlaylist}
                    />
                  ))}
                </ItemCardList>
              ) : (
                <Text mb={4}>{t("page.view_playlist.empty_playlist")}</Text>
              )}
            </Row>
            <Restricted
              to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
              isOwner={user?.id === playlist?.user?.id}
            >
              {/* upload file */}
              {editMode && (
                <>
                  <Row>
                    <Text
                      style={{
                        textTransform: "uppercase",
                        fontStyle: "italic",
                      }}
                    >
                      {t("page.view_playlist.upload_file")}
                    </Text>
                  </Row>

                  <VideoList
                    videos={videos}
                    isUploadingVideos={isLoading}
                    handleDeleteVideo={handleDeleteVideo}
                  />

                  <Row flex="auto">
                    <Column flex="auto">
                      <FileUploader
                        multiple
                        maxSize={MAX_FILE_SIZE_MB}
                        handleChange={handleFileUploaderChange}
                        onSizeError={handleFileUploaderSizeError(t)}
                        onTypeError={handleFileUploaderTypeError(t)}
                        name="file"
                        types={ALLOWED_VIDEO_TYPES}
                      />
                    </Column>
                  </Row>
                </>
              )}

              <UploadVideosProgress
                isUploading={isUploadingFiles}
                totalVideos={totalVideos}
                totalUploadedVideos={totalUploadedVideos}
                totalUploadedVideosPercentage={totalUploadedVideosPercentage}
                currentUploadFile={currentUploadFile}
                uploadProgress={uploadProgress}
              />

              {/* add playlist item */}

              {!editMode && (
                <>
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
                    <AddItemPlaylistDropzone show playlistId={playlist?.id} />
                  </Row>
                </>
              )}
            </Restricted>
          </form>
        </Container>
      </Section>
    </>
  );
};
