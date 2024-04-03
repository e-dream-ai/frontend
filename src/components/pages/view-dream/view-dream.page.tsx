import { yupResolver } from "@hookform/resolvers/yup";
import { useDeleteDream } from "@/api/dream/mutation/useDeleteDream";
import { useUpdateDream } from "@/api/dream/mutation/useUpdateDream";
import { useUpdateThumbnailDream } from "@/api/dream/mutation/useUpdateThumbnailDream";
import { DREAM_QUERY_KEY, useDream } from "@/api/dream/query/useDream";
import queryClient from "@/api/query-client";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { Button, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import Restricted from "@/components/shared/restricted/restricted";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import { FORMAT } from "@/constants/moment.constants";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import router from "@/routes/router";
import UpdateDreamSchema, {
  UpdateDreamFormValues,
} from "@/schemas/update-dream.schema";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { DreamVideoInput, ViewDreamInputs } from "./view-dream-inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGears,
  faPencil,
  faPlay,
  faSave,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { DreamStatusType } from "@/types/dream.types";
import { Video } from "./view-dream.styled";
import { getUserName } from "@/utils/user.util";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import { generateImageURLFromResource } from "@/utils/image-handler";
import useSocket from "@/hooks/useSocket";
import { emitPlayDream } from "@/utils/socket.util";
import { bytesToMegabytes } from "@/utils/file.util";
import { framesToSeconds, secondsToTimeFormat } from "@/utils/video.utils";
import { truncateString } from "@/utils/string.util";
import { useProcessDream } from "@/api/dream/mutation/useProcessDream";

type Params = { uuid: string };

const SectionID = "dream";

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid } = useParams<Params>();
  const { user } = useAuth();
  const {
    data,
    isLoading: isDreamLoading,
    refetch,
  } = useDream(uuid, {
    activeRefetchInterval: true,
  });
  const { socket } = useSocket();
  const dream = data?.data?.dream;

  const [editMode, setEditMode] = useState<boolean>(false);
  const [video, setVideo] = useState<MultiMediaState>();
  const [thumbnail, setTumbnail] = useState<MultiMediaState>();
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  const { mutate: mutateDream, isLoading: isLoadingDreamMutation } =
    useUpdateDream(uuid);
  const processDreamMutation = useProcessDream(uuid);
  const uploadDreamVideoMutation = useUploadDreamVideo({
    navigateToDream: false,
  });
  const {
    mutate: mutateThumbnailDream,
    isLoading: isLoadingThumbnailDreamMutation,
  } = useUpdateThumbnailDream(uuid);
  const { mutate: mutateDeleteDream, isLoading: isLoadingDeleteDreamMutation } =
    useDeleteDream(uuid);

  const isLoading =
    isLoadingDreamMutation ||
    uploadDreamVideoMutation.isLoading ||
    isLoadingThumbnailDreamMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<UpdateDreamFormValues>({
    resolver: yupResolver(UpdateDreamSchema),
    defaultValues: { name: "" },
  });

  const values = getValues();

  const isDreamProcessing: boolean = useMemo(
    () =>
      dream?.status === DreamStatusType.QUEUE ||
      dream?.status === DreamStatusType.PROCESSING,
    [dream],
  );

  const isOwner: boolean = useMemo(
    () => (user?.id ? user?.id === dream?.user?.id : false),
    [dream, user],
  );

  const showEditButton = !editMode && !isDreamProcessing;
  const showSaveAndCancelButtons = editMode && !isDreamProcessing;

  // Handlers

  const handleMutateVideoDream = async (data: UpdateDreamFormValues) => {
    if (isVideoRemoved || video?.file) {
      try {
        await uploadDreamVideoMutation.mutateAsync({
          file: video?.file,
          dream,
        });
        handleMutateThumbnailDream(data);
      } catch (error) {
        toast.error(t("page.view_dream.error_updating_dream"));
      }
    } else {
      handleMutateThumbnailDream(data);
    }
  };

  const handleMutateThumbnailDream = (data: UpdateDreamFormValues) => {
    if (isThumbnailRemoved || thumbnail?.file) {
      mutateThumbnailDream(
        { file: thumbnail?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutateDream(data);
            } else {
              toast.error(
                `${t("page.view_dream.error_updating_dream")} ${
                  response.message
                }`,
              );
            }
          },
          onError: () => {
            toast.error(t("page.view_dream.error_updating_dream"));
          },
        },
      );
    } else {
      handleMutateDream(data);
    }
  };

  const handleMutateDream = (data: UpdateDreamFormValues) => {
    mutateDream(
      { name: data.name, activityLevel: data.activityLevel },
      {
        onSuccess: (data) => {
          const dream = data?.data?.dream;
          if (data.success) {
            queryClient.setQueryData(
              [DREAM_QUERY_KEY, { uuid: dream?.uuid }],
              data,
            );
            reset({
              name: dream?.name,
              activityLevel: dream?.activityLevel,
            });
            toast.success(t("page.view_dream.dream_updated_successfully"));
            setEditMode(false);
          } else {
            toast.error(
              `${t("page.view_dream.error_updating_dream")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.view_dream.error_updating_dream"));
        },
      },
    );
  };

  const handleProcessDream = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      const response = await processDreamMutation.mutateAsync();
      if (response?.success) {
        toast.success(`${t("page.view_dream.dream_processing_successfully")}`);
        refetch();
      } else {
        toast.error(`${t("page.view_dream.error_processing_dream")}`);
      }
    } catch (_) {
      toast.error(`${t("page.view_dream.error_processing_dream")}`);
    }
  };

  const onSubmit = (data: UpdateDreamFormValues) => {
    handleMutateVideoDream(data);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    resetRemoteDreamForm();
    setIsVideoRemoved(false);
    setIsThumbnailRemoved(false);
    setVideo(undefined);
    setTumbnail(undefined);
    setEditMode(false);
  };

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

  const resetRemoteDreamForm = useCallback(() => {
    reset({
      name: dream?.name,
      activityLevel: dream?.activityLevel,
      processedVideoSize: dream?.processedVideoSize
        ? Math.round(bytesToMegabytes(dream?.processedVideoSize)) + " MB"
        : "-",
      processedVideoFrames: dream?.processedVideoFrames
        ? secondsToTimeFormat(
            Math.round(framesToSeconds(dream?.processedVideoFrames)),
          )
        : "-",
      processedVideoFPS: dream?.processedVideoFPS
        ? `${dream?.processedVideoFPS} Original FPS`
        : "-",
      owner: getUserName(dream?.user),
      created_at: moment(dream?.created_at).format(FORMAT),
    });
  }, [reset, dream]);

  const handleRemoveVideo = () => {
    setIsVideoRemoved(true);
  };

  const handleRemoveThumbnail = () => {
    setIsThumbnailRemoved(true);
  };

  const handleVideoChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setVideo({ file: files, url: URL.createObjectURL(files) });
    }
    setIsVideoRemoved(false);
  };

  const handleThumbnailChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setTumbnail({ file: files, url: URL.createObjectURL(files) });
    }
    setIsThumbnailRemoved(false);
  };

  const onConfirmDeleteDream = () => {
    mutateDeleteDream(null, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(`${t("page.view_dream.dream_deleted_successfully")}`);
          onHideConfirmDeleteModal();
          router.navigate(ROUTES.MY_DREAMS);
        } else {
          toast.error(
            `${t("page.view_dream.error_deleting_dream")} ${response.message}`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_dream.error_deleting_dream"));
      },
    });
  };

  const handlePlayDream = () => {
    emitPlayDream(socket, dream);
  };

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemoteDreamForm();
  }, [reset, resetRemoteDreamForm]);

  if (!uuid) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  if (isDreamLoading) {
    return (
      <Row justifyContent="center">
        <Spinner />
      </Row>
    );
  }

  return (
    <React.Fragment>
      {/**
       * Confirm delete modal
       */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onCancel={onHideConfirmDeleteModal}
        onConfirm={onConfirmDeleteDream}
        isConfirming={isLoadingDeleteDreamMutation}
        title={t("page.view_dream.confirm_delete_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_delete_modal_body")}{" "}
            <em>
              <strong>{truncateString(dream?.name, 30)}</strong>
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
              <h2 style={{ margin: 0 }}>{t("page.view_dream.title")}</h2>
            </Column>

            <Column flex="1" alignSelf="flex-end" alignItems="flex-end">
              {!editMode && (
                <Row margin={0}>
                  <Button
                    type="button"
                    buttonType="default"
                    transparent
                    mr="2"
                    onClick={handlePlayDream}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </Button>
                  <Button type="button" buttonType="default" transparent mr="2">
                    <FontAwesomeIcon icon={faThumbsUp} />
                  </Button>
                  <Button type="button" buttonType="default" transparent mr="2">
                    <FontAwesomeIcon icon={faThumbsDown} />
                  </Button>

                  <Restricted
                    to={DREAM_PERMISSIONS.CAN_DELETE_DREAM}
                    isOwner={isOwner}
                  >
                    <Button
                      type="button"
                      buttonType="danger"
                      transparent
                      mr="2"
                      onClick={onShowConfirmDeleteModal}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Restricted>
                </Row>
              )}
            </Column>
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row justifyContent="space-between" justifyItems="flex-end">
              <span />
              <div>
                {showEditButton && (
                  <Row justifyItems="flex-end">
                    <Restricted to={DREAM_PERMISSIONS.CAN_PROCESS_DREAM}>
                      <Button
                        type="button"
                        mr="2"
                        after={<FontAwesomeIcon icon={faGears} />}
                        isLoading={processDreamMutation.isLoading}
                        onClick={handleProcessDream}
                      >
                        {t("page.view_dream.rerun")}{" "}
                      </Button>
                    </Restricted>
                    <Restricted
                      to={DREAM_PERMISSIONS.CAN_EDIT_DREAM}
                      isOwner={isOwner}
                    >
                      <Button
                        type="button"
                        after={<FontAwesomeIcon icon={faPencil} />}
                        onClick={handleEdit}
                      >
                        {t("page.view_dream.edit")}{" "}
                      </Button>
                    </Restricted>
                  </Row>
                )}
                {showSaveAndCancelButtons && (
                  <React.Fragment>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {t("page.view_dream.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      after={<FontAwesomeIcon icon={faSave} />}
                      isLoading={isLoading}
                      ml="1rem"
                    >
                      {isLoading
                        ? t("page.view_dream.saving")
                        : t("page.view_dream.save")}
                    </Button>
                  </React.Fragment>
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
                  localMultimedia={thumbnail}
                  thumbnail={generateImageURLFromResource(dream?.thumbnail, {
                    width: 500,
                    fit: "cover",
                  })}
                  editMode={editMode}
                  isProcessing={isDreamProcessing}
                  isRemoved={isThumbnailRemoved}
                  handleChange={handleThumbnailChange}
                  handleRemove={handleRemoveThumbnail}
                  types={["JPG", "JPEG"]}
                />
              </Column>
              <Column ml={[0, 2, 2]} flex={["1 1 320px", "1", "1"]}>
                <ViewDreamInputs
                  dream={dream}
                  values={values}
                  register={register}
                  errors={errors}
                  editMode={editMode}
                />
              </Column>
            </Row>
            {!isDreamProcessing ? (
              <React.Fragment>
                <Row justifyContent="space-between">
                  <Text>0 {t("page.view_dream.votes")}</Text>
                  <Text>0 {t("page.view_dream.downvotes")}</Text>
                </Row>
                <Row justifyContent="space-between" alignItems="center">
                  <h3>{t("page.view_dream.original_video")}</h3>
                  {editMode && (
                    <Button
                      type="button"
                      buttonType="danger"
                      onClick={handleRemoveVideo}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                </Row>
                <Row justifyContent={["center", "center", "flex-start"]}>
                  <DreamVideoInput
                    dream={dream}
                    editMode={editMode}
                    video={video}
                    isRemoved={isVideoRemoved}
                    handleChange={handleVideoChange}
                  />
                </Row>
                <Row>
                  <h3>{t("page.view_dream.video")}</h3>
                </Row>
                <Row justifyContent={["center", "center", "flex-start"]}>
                  <Video controls src={video?.url || dream?.video} />
                </Row>
              </React.Fragment>
            ) : (
              false
            )}
          </form>
        </Container>
      </Section>
    </React.Fragment>
  );
};

export default ViewDreamPage;
