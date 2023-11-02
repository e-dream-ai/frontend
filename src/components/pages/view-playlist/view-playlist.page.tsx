import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdatePlaylist } from "api/playlist/mutation/useUpdatePlaylist";
import { usePlaylist } from "api/playlist/query/usePlaylist";
import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Column } from "components/shared/row/row";
import { Section } from "components/shared/section/section";
import { FORMAT } from "constants/moment.constants";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import UpdatePlaylistSchema, {
  UpdatePlaylistFormValues,
} from "schemas/update-playlist.schema";
import { ThumbnailPlaceholder } from "../view-dream/view-dream.styled";

type Params = { id: string };

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<Params>();
  const playlistId = Number(id) ?? 0;
  const { data } = usePlaylist(playlistId);
  const playlist = data?.data?.playlist;

  const [editMode, setEditMode] = useState<boolean>(false);
  const { isLoading } = useUpdatePlaylist(playlistId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePlaylistFormValues>({
    resolver: yupResolver(UpdatePlaylistSchema),
    defaultValues: { name: "" },
  });

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(false);
  };

  const resetRemotePlaylistForm = useCallback(() => {
    reset({
      name: playlist?.name,
      owner: playlist?.user.email,
      created_at: moment(playlist?.created_at).format(FORMAT),
    });
  }, [reset, playlist]);

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemotePlaylistForm();
  }, [reset, resetRemotePlaylistForm]);

  if (!id || !playlistId) {
    return <Navigate to="/" replace />;
  }

  return (
    <Section id={SectionID}>
      <Container>
        <form style={{ minWidth: "320px" }}>
          <h2>{t("page.view_playlist.title")}</h2>

          <Row justifyContent="space-between">
            <span />
            <div>
              {editMode ? (
                <>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    // disabled={isLoading}
                  >
                    {t("page.view_dream.cancel")}
                  </Button>

                  <Button
                    type="submit"
                    after={<i className="fa fa-save" />}
                    // isLoading={isLoading}
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
                  {t("page.view_playlist.edit")}
                </Button>
              )}
            </div>
          </Row>

          <Column>
            <Input
              disabled={!editMode}
              placeholder={t("page.view_playlist.name")}
              type="text"
              before={<i className="fa fa-file-video-o" />}
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              disabled
              placeholder={t("page.view_playlist.owner")}
              type="text"
              before={<i className="fa fa-user" />}
              {...register("owner")}
            />
            <Input
              disabled
              placeholder={t("page.view_playlist.created")}
              type="text"
              before={<i className="fa fa-calendar" />}
              {...register("created_at")}
            />
          </Column>
          <Row
            justifyContent="space-between"
            alignItems="center"
            style={{ marginTop: "5rem" }}
          >
            <h3>{t("page.view_playlist.thumbnail")}</h3>
          </Row>
          <Row>
            <ThumbnailPlaceholder>
              <i className="fa fa-picture-o" />
            </ThumbnailPlaceholder>
          </Row>
        </form>
      </Container>
    </Section>
  );
};
