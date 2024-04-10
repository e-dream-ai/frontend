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
import { useForm, Controller } from "react-hook-form";
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
import {
  getOrderedItemsPlaylistRequest,
  sortPlaylistItemsByDate,
  sortPlaylistItemsByName,
} from "@/utils/playlist.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faFileVideo,
  faPlay,
  faRankingStar,
  faSave,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName, isAdmin } from "@/utils/user.util";
import { emitPlayPlaylist } from "@/utils/socket.util";
import useSocket from "@/hooks/useSocket";
import { Select } from "@/components/shared/select/select";
import { useUsers } from "@/api/user/query/useUsers";
import { useImage } from "@/hooks/useImage";
import { User } from "@/types/auth.types";

type Params = { id: string };

type SortType = "name" | "date";

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<Params>();
  const playlistId = Number(id) ?? 0;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState<string>("");
  const { data, isLoading: isPlaylistLoading } = usePlaylist(playlistId);
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });
  const { socket } = useSocket();
  const playlist = data?.data?.playlist;
  const thumbnailUrl = useImage(playlist?.thumbnail, {
    width: 500,
    fit: "cover",
  });
  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner: boolean = useMemo(
    () => (user?.id ? user?.id === playlist?.user?.id : false),
    [playlist, user],
  );
  const allowedEditPlaylist = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST,
    isOwner: isOwner,
  });

  const allowedEditOwner = usePermission({
    permission: PLAYLIST_PERMISSIONS.CAN_EDIT_OWNER,
    isOwner,
  });

  const items = useMemo(
    () => playlist?.items?.sort((a, b) => a.order - b.order) ?? [],
    [playlist?.items],
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
  const orderPlaylistMutation = useOrderPlaylist(playlistId);

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
    control,
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
      {
        name: data.name,
        featureRank: data?.featureRank,
        displayedOwner: data?.displayedOwner?.value,
      },
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
      event.preventDefault();
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

  const handleOrderPlaylist = async (dropItem: SetItemOrder) => {
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
    try {
      const response = await orderPlaylistMutation.mutateAsync({
        order: requestPlaylistItems,
      });

      if (response.success) {
        toast.update(toastId, {
          render: t("page.view_playlist.playlist_items_ordered_successfully"),
          type: "success",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      } else {
        toast.update(toastId, {
          render: `${t("page.view_playlist.error_ordering_playlist_items")} ${
            response.message
          }`,
          type: "error",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      }
    } catch (_) {
      toast.update(toastId, {
        render: `${t("page.view_playlist.error_ordering_playlist_items")}`,
        type: "error",
        isLoading: false,
        ...TOAST_DEFAULT_CONFIG,
      });
    }
  };

  const handleOrderPlaylistBy = (type: SortType) => async () => {
    const items = playlist?.items;
    let orderedItems;
    if (type === "name") orderedItems = sortPlaylistItemsByName(items);
    else orderedItems = sortPlaylistItemsByDate(items);

    if (!orderedItems) {
      return;
    }

    const toastId = toast.loading(
      t("page.view_playlist.ordering_playlist_items"),
    );
    try {
      const response = await orderPlaylistMutation.mutateAsync({
        order: orderedItems,
      });

      if (response.success) {
        toast.update(toastId, {
          render: t("page.view_playlist.playlist_items_ordered_successfully"),
          type: "success",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      } else {
        toast.update(toastId, {
          render: `${t("page.view_playlist.error_ordering_playlist_items")} ${
            response.message
          }`,
          type: "error",
          isLoading: false,
          ...TOAST_DEFAULT_CONFIG,
        });
      }
    } catch (_) {
      toast.update(toastId, {
        render: `${t("page.view_playlist.error_ordering_playlist_items")}`,
        type: "error",
        isLoading: false,
        ...TOAST_DEFAULT_CONFIG,
      });
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

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

  const handlePlayPlaylist = () => {
    emitPlayPlaylist(
      socket,
      playlist,
      t("toasts.play_playlist", { name: playlist?.name }),
    );
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
            value: playlist?.displayedOwner?.id ?? -1,
            label: getUserName(playlist?.displayedOwner),
          }
        : {
            value: playlist?.displayedOwner?.id ?? playlist?.user?.id ?? -1,
            label: getUserName(playlist?.displayedOwner ?? playlist?.user),
          },
      featureRank: playlist?.featureRank,
      created_at: moment(playlist?.created_at).format(FORMAT),
    });
  }, [reset, playlist, isUserAdmin]);

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
                  rules={{ required: "Please select an option" }} // Example validation rule
                  render={({ field }) => (
                    <Select
                      {...field}
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
            </Row>
            <Row flex="auto">
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
