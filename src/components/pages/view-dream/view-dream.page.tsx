import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdateDream } from "api/dream/mutation/useUpdateDream";
import { useDream } from "api/dream/query/useDream";
import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Column } from "components/shared/row/row";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UpdateDreamSchema, {
  UpdateDreamFormValues,
} from "schemas/update-dream.schema";
import styled from "styled-components";
import { Video } from "./view-dream.styled";

type Params = { uuid: string };
const SectionID = "dream";

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid } = useParams<Params>();
  const { data } = useDream(uuid!);
  const dream = data?.data?.dream;

  const [edit, setEdit] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasThumbnail, setHasThumbnail] = useState(true);

  const { mutate, isLoading } = useUpdateDream(uuid);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDreamFormValues>({
    resolver: yupResolver(UpdateDreamSchema),
    values: { name: dream?.name ?? "" },
  });

  const onSubmit = (data: UpdateDreamFormValues) => {
    mutate(
      { name: data.name },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("dream updated");
            setEdit(false);
            reset();
          } else {
            toast.error("error updating dream");
          }
        },
        onError: () => {
          toast.error("error updating dream");
        },
      },
    );
  };

  const handleEdit = () => setEdit(true);

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
              {edit ? (
                <Button
                  type="submit"
                  after={<i className="fa fa-save" />}
                  isLoading={isLoading}
                >
                  {t("page.view_dream.save")}
                </Button>
              ) : (
                <Button
                  type="button"
                  after={<i className="fa fa-pencil" />}
                  onClick={handleEdit}
                >
                  {t("page.view_dream.edit")}
                </Button>
              )}
              <Button after={<i className="fa fa-thumbs-up" />} marginLeft>
                {t("page.view_dream.upvote")}
              </Button>
              <Button after={<i className="fa fa-thumbs-down" />} marginLeft>
                {t("page.view_dream.downvote")}
              </Button>
            </div>
          </Row>
          <Column>
            <Input
              disabled={!edit}
              placeholder={t("page.view_dream.name")}
              type="text"
              before={<i className="fa fa-file-video-o" />}
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              disabled
              placeholder={t("page.view_dream.owner")}
              type="text"
              before={<i className="fa fa-user" />}
              // {...register("owner")}
            />
            <Input
              disabled
              placeholder={t("page.view_dream.created")}
              type="text"
              before={<i className="fa fa-calendar" />}
              // {...register("created_at")}
            />
            <Row justifyContent="space-between">
              <Text>5 {t("page.view_dream.votes")}</Text>
              <Text>2 {t("page.view_dream.downvotes")}</Text>
            </Row>
          </Column>

          <Row justifyContent="space-between" alignItems="center">
            <h3>{t("page.view_dream.video")}</h3>
            {edit && hasVideo && (
              <Button size="sm" onClick={() => setHasVideo(false)}>
                <i className="fa fa-trash" />
              </Button>
            )}
          </Row>
          <Row>
            {hasVideo ? (
              <Video src={dream?.video} />
            ) : (
              <FileUploader
                handleChange={() => setHasVideo(true)}
                name="file"
                types={["MP4"]}
              />
            )}
          </Row>

          <Row
            justifyContent="space-between"
            alignItems="center"
            style={{ marginTop: "5rem" }}
          >
            <h3>{t("page.view_dream.thumbnail")}</h3>
            {edit && hasThumbnail && (
              <Button size="sm" onClick={() => setHasThumbnail(false)}>
                <i className="fa fa-trash" />
              </Button>
            )}
          </Row>
          <Row>
            {hasThumbnail ? (
              <ThumbnailPlaceholder>
                <i className="fa fa-picture-o" />
              </ThumbnailPlaceholder>
            ) : (
              <FileUploader
                handleChange={() => setHasThumbnail(true)}
                name="file"
                types={["JPEG", "JPG"]}
              />
            )}
          </Row>
        </form>
      </Container>
    </Section>
  );
};

const VideoPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(10, 10, 10, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
const ThumbnailPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(10, 10, 10, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export default ViewDreamPage;
