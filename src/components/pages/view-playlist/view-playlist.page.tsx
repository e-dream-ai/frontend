import { yupResolver } from "@hookform/resolvers/yup";
import { useUpdatePlaylist } from "@/api/playlist/mutation/useUpdatePlaylist";
import {
  PLAYLIST_QUERY_KEY,
  usePlaylist,
} from "@/api/playlist/query/usePlaylist";
import queryClient from "@/api/query-client";
import {
  AddItemPlaylistDropzone,
  Button,
  Input,
  ItemCardList,
  Row,
} from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { FORMAT } from "@/constants/moment.constants";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UpdatePlaylistSchema, {
  UpdatePlaylistFormValues,
} from "@/schemas/update-playlist.schema";

import { useDeletePlaylist } from "@/api/playlist/mutation/useDeletePlaylist";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { useOrderPlaylist } from "@/api/playlist/mutation/useOrderPlaylist";
import { useUpdateThumbnailPlaylist } from "@/api/playlist/mutation/useUpdateThumbnailPlaylist";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { ItemCard } from "@/components/shared";
import Restricted from "@/components/shared/restricted/restricted";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import { PLAYLIST_PERMISSIONS } from "@/constants/permissions.constants";
import { ROUTES } from "@/constants/routes.constants";
import { TOAST_DEFAULT_CONFIG } from "@/constants/toast.constants";
import useAuth from "@/hooks/useAuth";
import usePermission from "@/hooks/usePermission";
import router from "@/routes/router";
import { ItemOrder, SetItemOrder } from "@/types/dnd.types";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { getOrderedItemsPlaylistRequest } from "@/utils/playlist.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faFileVideo,
  faSave,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";

type Params = { id: string };

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<Params>();
  const playlistId = Number(id) ?? 0;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading: isPlaylistLoading } = usePlaylist(playlistId);
  const playlist = data?.data?.playlist;
  const isOwner = user?.id === playlist?.user?.id;
  const allowedEditPlaylist = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST,
    isOwner: isOwner,
  });
  const items = useMemo(
    () =>
      playlist?.items
        ?.sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index })) ?? [],
    [playlist],
  );

  const [editMode, setEditMode] = useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);
  const [thumbnail, setTumbnail] = useState<MultiMediaState>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  const { mutate, isLoading: isLoadingPlaylistMutation } =
    useUpdatePlaylist(playlistId);
  const {
    mutate: mutateThumbnailPlaylist,
    isLoading: isLoadingThumbnailPlaylistMutation,
  } = useUpdateThumbnailPlaylist(playlistId);
  const {
    mutate: mutateDeletePlaylist,
    isLoading: isLoadingDeletePlaylistMutation,
  } = useDeletePlaylist(playlistId);
  const { mutate: mutateOrderPlaylist } = useOrderPlaylist(playlistId);

  const { mutate: mutateDeletePlaylistItem } =
    useDeletePlaylistItem(playlistId);

  const isLoading =
    isLoadingPlaylistMutation || isLoadingThumbnailPlaylistMutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<UpdatePlaylistFormValues>({
    resolver: yupResolver(UpdatePlaylistSchema),
    defaultValues: { name: "" },
  });

  const values = getValues();

  const handleMutateThumbnailPlaylist = (data: UpdatePlaylistFormValues) => {
    if (isThumbnailRemoved || thumbnail?.file) {
      mutateThumbnailPlaylist(
        { file: thumbnail?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutatePlaylist(data);
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
    } else {
      handleMutatePlaylist(data);
    }
  };

  const handleMutatePlaylist = (data: UpdatePlaylistFormValues) => {
    mutate(
      { name: data.name },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData(
              [PLAYLIST_QUERY_KEY, playlistId],
              response,
            );
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

  const handleDeletePlaylistItem =
    (itemId: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      const toastId = toast.loading(
        t("page.view_playlist.deleting_playlist_item"),
      );
      mutateDeletePlaylistItem(
        { itemId },
        {
          onSuccess: (response) => {
            if (response.success) {
              queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistId]);
              toast.update(toastId, {
                render: t(
                  "page.view_playlist.playlist_item_deleted_successfully",
                ),
                type: "success",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            } else {
              toast.update(toastId, {
                render: `${t(
                  "page.view_playlist.error_deleting_playlist_item",
                )} ${response.message}`,
                type: "error",
                isLoading: false,
                ...TOAST_DEFAULT_CONFIG,
              });
            }
          },
          onError: () => {
            toast.update(toastId, {
              render: `${t("page.view_playlist.error_deleting_playlist_item")}`,
              type: "error",
              isLoading: false,
              ...TOAST_DEFAULT_CONFIG,
            });
          },
        },
      );
    };

  const handleOrderPlaylist = (dropItem: SetItemOrder) => {
    /**
     * Validate new index value
     */
    if (dropItem.newIndex < 0) {
      dropItem.newIndex = 0;
    } else if (dropItem.newIndex > items.length - 1) {
      dropItem.newIndex = items.length - 1;
    }

    const requestPlaylistItems: ItemOrder[] = getOrderedItemsPlaylistRequest({
      items: items.map((i) => ({ id: i.id, order: i.order }) as ItemOrder),
      dropItem,
    });

    const toastId = toast.loading(
      t("page.view_playlist.ordering_playlist_items"),
    );
    mutateOrderPlaylist(
      { order: requestPlaylistItems },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.update(toastId, {
              render: t(
                "page.view_playlist.playlist_items_ordered_successfully",
              ),
              type: "success",
              isLoading: false,
              ...TOAST_DEFAULT_CONFIG,
            });
          } else {
            toast.update(toastId, {
              render: `${t(
                "page.view_playlist.error_ordering_playlist_items",
              )} ${response.message}`,
              type: "error",
              isLoading: false,
              ...TOAST_DEFAULT_CONFIG,
            });
          }
        },
        onError: () => {
          toast.update(toastId, {
            render: `${t("page.view_playlist.error_ordering_playlist_items")}`,
            type: "error",
            isLoading: false,
            ...TOAST_DEFAULT_CONFIG,
          });
        },
      },
    );
  };

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

  const handleThumbnailChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setTumbnail({ file: files, url: URL.createObjectURL(files) });
    }
    setIsThumbnailRemoved(false);
  };

  const onSubmit = (data: UpdatePlaylistFormValues) => {
    handleMutateThumbnailPlaylist(data);
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
          router.navigate(ROUTES.FEED);
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
      owner: getUserName(playlist?.user),
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
        onConfirm={onConfirmDeletePlaylist}
        isConfirming={isLoadingDeletePlaylistMutation}
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
          <Row justifyContent="space-between" separator>
            <h2>{t("page.view_playlist.title")}</h2>
            {!editMode && (
              <Restricted
                to={PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST}
                isOwner={isOwner}
              >
                <Row marginBottom={0}>
                  <Button
                    type="button"
                    buttonType="danger"
                    transparent
                    ml="1rem"
                    onClick={onShowConfirmDeleteModal}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Row>
              </Restricted>
            )}
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
                    isOwner={user?.id === playlist?.user?.id}
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
            <Row justifyContent="space-between">
              <Column flex="1 1 auto" mr={1}>
                <ThumbnailInput
                  thumbnail={playlist?.thumbnail}
                  localMultimedia={thumbnail}
                  editMode={editMode}
                  isRemoved={isThumbnailRemoved}
                  handleChange={handleThumbnailChange}
                  handleRemove={handleRemoveThumbnail}
                  types={["JPG", "JPEG"]}
                />
              </Column>
              <Column flex="1 1 auto" ml={1}>
                <Input
                  disabled={!editMode}
                  placeholder={t("page.view_playlist.name")}
                  type="text"
                  before={<FontAwesomeIcon icon={faFileVideo} />}
                  error={errors.name?.message}
                  value={values.name}
                  {...register("name")}
                />
                <Input
                  disabled
                  placeholder={t("page.view_playlist.owner")}
                  type="text"
                  before={<FontAwesomeIcon icon={faUser} />}
                  value={values.owner}
                  anchor={() =>
                    navigate(`${ROUTES.PROFILE}/${playlist?.user.id ?? 0}`)
                  }
                  {...register("owner")}
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
            </Row>
            <Row>
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
                    onDelete={handleDeletePlaylistItem(i.id)}
                    onOrder={handleOrderPlaylist}
                  />
                ))}
              </ItemCardList>
            </Row>
            <Restricted
              to={PLAYLIST_PERMISSIONS.CAN_EDIT_PLAYLIST}
              isOwner={user?.id === playlist?.user?.id}
            >
              <Row>
                <AddItemPlaylistDropzone show playlistId={playlist?.id} />
              </Row>
            </Restricted>
          </form>
        </Container>
      </Section>
    </>
  );
};
