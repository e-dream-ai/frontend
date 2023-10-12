import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdateDream } from "api/dream/mutation/useUpdateDream";
import { useUpdateThumbnailDream } from "api/dream/mutation/useUpdateThumbnailDream";
import { useUpdateVideoDream } from "api/dream/mutation/useUpdateVideoDream";
import { DREAM_QUERY_KEY, useDream } from "api/dream/query/useDream";
import queryClient from "api/query-client";
import { Button, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Column } from "components/shared/row/row";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { FORMAT } from "constants/moment.constants";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UpdateDreamSchema, {
  UpdateDreamFormValues,
} from "schemas/update-dream.schema";
import { DreamMediaState } from "types/dream.types";
import {
  DreamVideoInput,
  ThumbnailDreamInput,
  ViewDreamInputs,
} from "./view-dream-inputs";

type Params = { uuid: string };

const SectionID = "dream";

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid } = useParams<Params>();
  const { data } = useDream(uuid);
  const dream = data?.data?.dream;

  const [editMode, setEditMode] = useState(false);
  const [video, setVideo] = useState<DreamMediaState>();
  const [thumbnail, setTumbnail] = useState<DreamMediaState>();
  const [isVideoRemoved, setIsVideoRemoved] = useState(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState(false);

  const { mutate: mutateDream, isLoading: isLoadingDreamMutation } =
    useUpdateDream(uuid);
  const { mutate: mutateVideoDream, isLoading: isLoadingVideoDreamMutation } =
    useUpdateVideoDream(uuid);
  const {
    mutate: mutateThumbnailDream,
    isLoading: isLoadingThumbnailDreamMutation,
  } = useUpdateThumbnailDream(uuid);

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
    if (isVideoRemoved || video?.fileBlob) {
      mutateVideoDream(
        { file: video?.fileBlob },
        {
          onSuccess: () => {
            handleMutateThumbnailDream(data);
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
    if (isThumbnailRemoved || thumbnail?.fileBlob) {
      mutateThumbnailDream(
        { file: thumbnail?.fileBlob },
        {
          onSuccess: () => {
            handleMutateDream(data);
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

  const handleVideoChange = (file: Blob) => {
    setVideo({ fileBlob: file, url: URL.createObjectURL(file) });
    setIsVideoRemoved(false);
  };

  const handleThumbnailChange = (file: Blob) => {
    setTumbnail({ fileBlob: file, url: URL.createObjectURL(file) });
    setIsThumbnailRemoved(false);
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

  return (
    <Section id={SectionID}>
      <Container>
        <form style={{ minWidth: "320px" }} onSubmit={handleSubmit(onSubmit)}>
          <h2>{t("page.view_dream.view_dream")}</h2>
          <Row justifyContent="space-between">
            <span />
            <div>
              {editMode ? (
                <>
                  <Button type="button" onClick={handleCancel}>
                    {t("page.view_dream.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    after={<i className="fa fa-save" />}
                    isLoading={isLoading}
                    marginLeft
                  >
                    {t("page.view_dream.save")}
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
              <Button
                type="button"
                after={<i className="fa fa-thumbs-up" />}
                marginLeft
              >
                {t("page.view_dream.upvote")}
              </Button>
              <Button
                type="button"
                after={<i className="fa fa-thumbs-down" />}
                marginLeft
              >
                {t("page.view_dream.downvote")}
              </Button>
            </div>
          </Row>
          <Column>
            <ViewDreamInputs
              register={register}
              errors={errors}
              editMode={editMode}
            />
            <Row justifyContent="space-between">
              <Text>0 {t("page.view_dream.votes")}</Text>
              <Text>0 {t("page.view_dream.downvotes")}</Text>
            </Row>
          </Column>

          <Row justifyContent="space-between" alignItems="center">
            <h3>{t("page.view_dream.video")}</h3>
            {editMode && (
              <Button type="button" size="sm" onClick={handleRemoveVideo}>
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

          <Row
            justifyContent="space-between"
            alignItems="center"
            style={{ marginTop: "5rem" }}
          >
            <h3>{t("page.view_dream.thumbnail")}</h3>
            {editMode && (
              <Button type="button" size="sm" onClick={handleRemoveThumbnail}>
                <i className="fa fa-trash" />
              </Button>
            )}
          </Row>
          <Row>
            <ThumbnailDreamInput
              dream={dream}
              editMode={editMode}
              thumbnail={thumbnail}
              isRemoved={isThumbnailRemoved}
              handleChange={handleThumbnailChange}
            />
          </Row>
        </form>
      </Container>
    </Section>
  );
};

export default ViewDreamPage;
