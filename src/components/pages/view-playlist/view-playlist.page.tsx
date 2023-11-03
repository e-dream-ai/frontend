import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdatePlaylist } from "api/playlist/mutation/useUpdatePlaylist";
import {
  PLAYLIST_QUERY_KEY,
  usePlaylist,
} from "api/playlist/query/usePlaylist";
import queryClient from "api/query-client";
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
import { toast } from "react-toastify";
import UpdatePlaylistSchema, {
  UpdatePlaylistFormValues,
} from "schemas/update-playlist.schema";
import { MediaState } from "types/media.types";

import { useDeletePlaylist } from "api/playlist/mutation/useDeletePlaylist";
import { ConfirmModal } from "components/modals/confirm.modal";
import { Spinner } from "components/shared/spinner/spinner";
import Text from "components/shared/text/text";
import { ROUTES } from "constants/routes.constants";
import router from "routes/router";
import { ThumbnailPlaylistInput } from "./view-playlist-inputs";

type Params = { id: string };

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<Params>();
  const playlistId = Number(id) ?? 0;
  const { data, isLoading: isPlaylistLoading } = usePlaylist(playlistId);
  const playlist = data?.data?.playlist;

  const [editMode, setEditMode] = useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);
  const [thumbnail, setTumbnail] = useState<MediaState>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  const { mutate, isLoading } = useUpdatePlaylist(playlistId);
  const { mutate: mutateDeletePlaylist, isLoading: isLoadingDeleteDream } =
    useDeletePlaylist(playlistId);
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
    setIsThumbnailRemoved(false);
    setTumbnail(undefined);
  };

  const handleRemoveThumbnail = () => {
    setIsThumbnailRemoved(true);
  };

  const handleThumbnailChange = (file: Blob) => {
    setTumbnail({ fileBlob: file, url: URL.createObjectURL(file) });
    setIsThumbnailRemoved(false);
  };

  const onSubmit = (data: UpdatePlaylistFormValues) => {
    mutate(
      { name: data.name },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData([PLAYLIST_QUERY_KEY, playlist?.id], data);
            reset({ name: response?.data?.playlist.name });
            toast.success(
              `${t("page.view_playlist.playlist_updated_successfully")}`,
            );
            setEditMode(false);
          } else {
            toast.error(
              `${t("page.view_playlist.error_updating_playlist")} ${
                response.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.view_playlist.error_updating_playlist"));
        },
      },
    );
  };

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

  const onConfirmDeletePlaylist = () => {
    mutateDeletePlaylist(null, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(
            `${t("page.view_playlist.playlist_deleted_successfully")}`,
          );
          onHideConfirmDeleteModal();
          router.navigate(ROUTES.PLAYLIST);
        } else {
          toast.error(
            `${t("page.view_playlist.error_deleting_playlist")} ${
              response.message
            }`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_playlist.error_deleting_playlist"));
      },
    });
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
        onConfirm={onConfirmDeletePlaylist}
        isConfirming={isLoadingDeleteDream}
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
          <form style={{ minWidth: "320px" }} onSubmit={handleSubmit(onSubmit)}>
            <h2>{t("page.view_playlist.title")}</h2>
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
                      after={<i className="fa fa-save" />}
                      isLoading={isLoading}
                      marginLeft
                    >
                      {isLoading
                        ? t("page.view_playlist.saving")
                        : t("page.view_playlist.save")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      after={<i className="fa fa-pencil" />}
                      onClick={handleEdit}
                    >
                      {t("page.view_playlist.edit")}
                    </Button>
                    <Button
                      type="button"
                      marginLeft
                      onClick={onShowConfirmDeleteModal}
                    >
                      <i className="fa fa-trash" />
                    </Button>
                  </>
                )}
              </div>
            </Row>
            <Row justifyContent="space-between">
              <Column flex="1 1 auto" ml="0.5rem">
                <ThumbnailPlaylistInput
                  playlist={playlist}
                  editMode={editMode}
                  thumbnail={thumbnail}
                  isRemoved={isThumbnailRemoved}
                  handleChange={handleThumbnailChange}
                  handleRemove={handleRemoveThumbnail}
                />
              </Column>
              <Column flex="1 1 auto" mr="0.5rem">
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
            </Row>
            <Row justifyContent="space-between" alignItems="center">
              <h3>{t("page.view_playlist.dreams")}</h3>
            </Row>
          </form>
        </Container>
      </Section>
    </>
  );
};
