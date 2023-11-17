import { yupResolver } from "@hookform/resolvers/yup";
import { useDeleteDream } from "api/dream/mutation/useDeleteDream";
import { useUpdateDream } from "api/dream/mutation/useUpdateDream";
import { useUpdateThumbnailDream } from "api/dream/mutation/useUpdateThumbnailDream";
import { useUpdateVideoDream } from "api/dream/mutation/useUpdateVideoDream";
import { DREAM_QUERY_KEY, useDream } from "api/dream/query/useDream";
import queryClient from "api/query-client";
import { ConfirmModal } from "components/modals/confirm.modal";
import { Button, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Column } from "components/shared/row/row";
import { Section } from "components/shared/section/section";
import { Spinner } from "components/shared/spinner/spinner";
import Text from "components/shared/text/text";
import { ThumbnailInput } from "components/shared/thumbnail-input/thumbnail-input";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import router from "routes/router";
import UpdateDreamSchema, {
  UpdateDreamFormValues,
} from "schemas/update-dream.schema";
import { FileTypes, MultiMediaState } from "types/media.types";
import { DreamVideoInput, ViewDreamInputs } from "./view-dream-inputs";

type Params = { uuid: string };

const SectionID = "dream";

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid } = useParams<Params>();
  const { data, isLoading: isDreamLoading } = useDream(uuid);
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
  const { mutate: mutateVideoDream, isLoading: isLoadingVideoDreamMutation } =
    useUpdateVideoDream(uuid);
  const {
    mutate: mutateThumbnailDream,
    isLoading: isLoadingThumbnailDreamMutation,
  } = useUpdateThumbnailDream(uuid);
  const { mutate: mutateDeleteDream, isLoading: isLoadingDeleteDreamMutation } =
    useDeleteDream(uuid);

  const isLoading =
    isLoadingDreamMutation ||
    isLoadingVideoDreamMutation ||
    isLoadingThumbnailDreamMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDreamFormValues>({
    resolver: yupResolver(UpdateDreamSchema),
    defaultValues: { name: "" },
  });

  const handleMutateVideoDream = (data: UpdateDreamFormValues) => {
    if (isVideoRemoved || video?.file) {
      mutateVideoDream(
        { file: video?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutateThumbnailDream(data);
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
      { name: data.name },
      {
        onSuccess: (data) => {
          if (data.success) {
            queryClient.setQueryData(
              [DREAM_QUERY_KEY, { uuid: dream?.uuid }],
              data,
            );
            reset({ name: data?.data?.dream.name });
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
      owner: dream?.user.email,
      created_at: moment(dream?.created_at).format(FORMAT),
    });
  }, [reset, dream]);

  const handleRemoveVideo = () => {
    setIsVideoRemoved(true);
  };

  const handleRemoveThumbnail = () => {
    setIsThumbnailRemoved(true);
  };

  const handleVideoChange = (file: FileTypes) => {
    setVideo({ file: file, url: URL.createObjectURL(file as Blob) });
    setIsVideoRemoved(false);
  };

  const handleThumbnailChange = (file: FileTypes) => {
    setTumbnail({ file: file, url: URL.createObjectURL(file as Blob) });
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

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemoteDreamForm();
  }, [reset, resetRemoteDreamForm]);

  if (!uuid) {
    return <Navigate to="/" replace />;
  }

  if (isDreamLoading) {
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
        onConfirm={onConfirmDeleteDream}
        isConfirming={isLoadingDeleteDreamMutation}
        title={t("page.view_dream.confirm_delete_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_delete_modal_body")}{" "}
            <em>
              <strong>{dream?.name}</strong>
            </em>
          </Text>
        }
      />
      <Section id={SectionID}>
        <Container>
          <Row justifyContent="space-between" separator>
            <h2>{t("page.view_dream.title")}</h2>
            {!editMode && (
              <Row>
                <Button
                  type="button"
                  buttonType="default"
                  after={<i className="fa fa-thumbs-up" />}
                  transparent
                  marginLeft
                />
                <Button
                  type="button"
                  buttonType="default"
                  after={<i className="fa fa-thumbs-down" />}
                  transparent
                  marginLeft
                />
                <Button
                  type="button"
                  buttonType="danger"
                  after={<i className="fa fa-trash" />}
                  transparent
                  marginLeft
                  onClick={onShowConfirmDeleteModal}
                />
              </Row>
            )}
          </Row>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                      {t("page.view_dream.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      after={<i className="fa fa-save" />}
                      isLoading={isLoading}
                      marginLeft
                    >
                      {isLoading
                        ? t("page.view_dream.saving")
                        : t("page.view_dream.save")}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    after={<i className="fa fa-pencil" />}
                    onClick={handleEdit}
                  >
                    {t("page.view_dream.edit")}
                  </Button>
                )}
              </div>
            </Row>
            <Row>
              <Column flex="1 1 auto" mr={1}>
                <ThumbnailInput
                  localMultimedia={thumbnail}
                  thumbnail={dream?.thumbnail}
                  editMode={editMode}
                  isRemoved={isThumbnailRemoved}
                  handleChange={handleThumbnailChange}
                  handleRemove={handleRemoveThumbnail}
                  types={["JPG", "JPEG"]}
                />
              </Column>
              <Column flex="1 1 auto" ml={1}>
                <ViewDreamInputs
                  register={register}
                  errors={errors}
                  editMode={editMode}
                />
              </Column>
            </Row>
            <Row justifyContent="space-between">
              <Text>0 {t("page.view_dream.votes")}</Text>
              <Text>0 {t("page.view_dream.downvotes")}</Text>
            </Row>

            <Row justifyContent="space-between" alignItems="center">
              <h3>{t("page.view_dream.video")}</h3>
              {editMode && (
                <Button
                  type="button"
                  buttonType="danger"
                  onClick={handleRemoveVideo}
                >
                  <i className="fa fa-trash" />
                </Button>
              )}
            </Row>
            <Row>
              <DreamVideoInput
                dream={dream}
                editMode={editMode}
                video={video}
                isRemoved={isVideoRemoved}
                handleChange={handleVideoChange}
              />
            </Row>
          </form>
        </Container>
      </Section>
    </>
  );
};

export default ViewDreamPage;
