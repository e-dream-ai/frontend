import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Input,
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
import { Navigate, useParams } from "react-router-dom";
import UpdateKeyframeSchema, {
  UpdateKeyframeFormValues,
} from "@/schemas/update-keyframe.schema";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import Restricted from "@/components/shared/restricted/restricted";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { ThumbnailInput } from "@/components/shared/thumbnail-input/thumbnail-input";
import { KEYFRAMES_PERMISSIONS } from "@/constants/permissions.constants";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faFileVideo,
  faSave,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName, isAdmin } from "@/utils/user.util";
import { Select } from "@/components/shared/select/select";
import { toast } from "react-toastify";
import { NotFound } from "@/components/shared/not-found/not-found";
import { KEYFRAME_QUERY_KEY, useKeyframe } from "@/api/keyframe/query/useKeyframe";
import { User } from "@/types/auth.types";
import { useUsers } from "@/api/user/query/useUsers";
import usePermission from "@/hooks/usePermission";
import { useImage } from "@/hooks/useImage";
import router from "@/routes/router";
import { useDeleteKeyframe } from "@/api/keyframe/mutation/useDeleteKeyframe";
import queryClient from "@/api/query-client";
import { useUpdateKeyframe } from "@/api/keyframe/mutation/useUpdateKeyframe";

type Params = { uuid: string };

const SectionID = "keyframe";

/**
 * View keyframe page
 */
export const ViewKeyframePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { uuid } = useParams<Params>();
  const [userSearch, setUserSearch] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);
  const [image, setImage] = useState<MultiMediaState>();
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  const { data, isLoading: isKeyframeLoading, isError } = useKeyframe(uuid);
  const keyframe = data?.data?.keyframe;
  const imageUrl = useImage(keyframe?.image, {
    width: 500,
    fit: "cover",
  });

  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: userSearch,
  });

  const { mutate: mutateKeyframe, isLoading: isLoadingKeyframeMutation } =useUpdateKeyframe();
  const { mutate: mutateDeleteKeyframe, isLoading: isLoadingDeleteKeyframe } = useDeleteKeyframe();

  const usersOptions = (usersData?.data?.users ?? [])
    .filter((user) => user.name)
    .map((user) => ({
      label: user?.name ?? "-",
      value: user?.id,
    }));

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const isOwner: boolean = useMemo(
    () => (user?.id ? user?.id === keyframe?.user?.id : false),
    [keyframe, user],
  );

  const allowedEditOwner = usePermission({
    permission: KEYFRAMES_PERMISSIONS.CAN_EDIT_OWNER,
    isOwner,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    control,
  } = useForm<UpdateKeyframeFormValues>({
    resolver: yupResolver(UpdateKeyframeSchema),
    defaultValues: { name: "" },
  });

  const values = getValues();

  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    resetRemoteKeyframeForm();
    setEditMode(false);
    setIsImageRemoved(false);
    setImage(undefined);
  };

  const handleRemoveThumbnail = () => {
    setIsImageRemoved(true);
  };

  const handleThumbnailChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setImage({ file: files, url: URL.createObjectURL(files) });
    }
    setIsImageRemoved(false);
  };

  const onSubmit = (data: UpdateKeyframeFormValues) => {
    mutateKeyframe(
      {
        uuid: uuid!,
        values: {
          name: data.name,
          displayedOwner: data?.displayedOwner?.value,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData([KEYFRAME_QUERY_KEY, uuid], response);
            reset({ name: response?.data?.keyframe.name });
            toast.success(
              `${t("page.view_keyframe.keyframe_updated_successfully")}`,
            );
            setEditMode(false);
          } else {
            toast.error(
              `${t("page.view_keyframe.error_updating_keyframe")} ${response.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("page.view_keyframe.error_updating_keyframe"));
        },
      },
    );
  };


  const handleConfirmDeleteKeyframe = () => {
    mutateDeleteKeyframe(uuid!, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(
            `${t("page.view_keyframe.keyframe_deleted_successfully")}`,
          );
          onHideConfirmDeleteModal();
          router.navigate(ROUTES.FEED);
        } else {
          toast.error(
            `${t("page.view_keyframe.error_deleting_keyframe")} ${response.message
            }`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_keyframe.error_deleting_keyframe"));
      },
    });
  };


  const resetRemoteKeyframeForm = useCallback(() => {
    reset({
      name: keyframe?.name,
      user: keyframe?.user?.name,
      /**
       * set displayedOwner
       * for admins always show displayedOwner
       * for normal users show displayedOwner, if doesn't exists, show user
       */
      displayedOwner: isUserAdmin
        ? {
          value: keyframe?.displayedOwner?.id,
          label: getUserName(keyframe?.displayedOwner),
        }
        : {
          value: keyframe?.displayedOwner?.id ?? keyframe?.user?.id,
          label: getUserName(keyframe?.displayedOwner ?? keyframe?.user),
        },
      created_at: moment(keyframe?.created_at).format(FORMAT),
    });
  }, [reset, keyframe, isUserAdmin]);

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemoteKeyframeForm();
  }, [reset, resetRemoteKeyframeForm]);

  if (!uuid) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  if (isError) {
    return <NotFound />;
  }

  if (isKeyframeLoading) {
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
        isConfirming={isLoadingDeleteKeyframe}
        onCancel={onHideConfirmDeleteModal}
        onConfirm={handleConfirmDeleteKeyframe}
        title={t("page.view_keyframe.confirm_delete_modal_title")}
        text={
          <Text>
            {t("page.view_keyframe.confirm_delete_modal_body")}{" "}
            <em>
              <strong>{keyframe?.name}</strong>
            </em>
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
              <h2 style={{ margin: 0 }}>{t("page.view_keyframe.title")}</h2>
            </Column>

            <Column flex="1" alignSelf="flex-end" alignItems="flex-end">
              <Row marginBottom={0} alignItems="center">
                {!editMode && (
                  <Restricted
                    to={KEYFRAMES_PERMISSIONS.CAN_DELETE_KEYFRAMES}
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
          <form style={{ minWidth: "320px" }} onSubmit={handleSubmit(onSubmit)}>
            <Row justifyContent="space-between">
              <span />
              <div>
                {editMode ? (
                  <>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoadingKeyframeMutation}
                    >
                      {t("page.view_keyframe.cancel")}
                    </Button>

                    <Button
                      type="submit"
                      after={<FontAwesomeIcon icon={faSave} />}
                      isLoading={isLoadingKeyframeMutation}
                      ml="1rem"
                    >
                      {isLoadingKeyframeMutation
                        ? t("page.view_keyframe.saving")
                        : t("page.view_keyframe.save")}
                    </Button>
                  </>
                ) : (
                  <Restricted
                    to={KEYFRAMES_PERMISSIONS.CAN_EDIT_KEYFRAMES}
                    isOwner={isOwner}
                  >
                    <Button
                      type="button"
                      after={<FontAwesomeIcon icon={faSave} />}
                      onClick={handleEdit}
                    >
                      {t("page.view_keyframe.edit")}
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
                  thumbnail={imageUrl}
                  localMultimedia={image}
                  editMode={editMode}
                  isRemoved={isImageRemoved}
                  handleChange={handleThumbnailChange}
                  handleRemove={handleRemoveThumbnail}
                />
              </Column>
              <Column ml={[0, 2, 2]} flex={["1 1 320px", "1", "1"]}>
                <Input
                  disabled={!editMode}
                  placeholder={t("page.view_keyframe.name")}
                  type="text"
                  before={<FontAwesomeIcon icon={faFileVideo} />}
                  error={errors.name?.message}
                  value={values.name}
                  {...register("name")}
                />

                <Restricted
                  to={KEYFRAMES_PERMISSIONS.CAN_VIEW_ORIGINAL_OWNER}
                  isOwner={user?.id === keyframe?.user?.id}
                >
                  <Input
                    disabled
                    placeholder={t("page.view_keyframe.owner")}
                    type="text"
                    before={<FontAwesomeIcon icon={faSave} />}
                    value={values.user}
                    to={`${ROUTES.PROFILE}/${keyframe?.user.uuid}`}
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
                      to={
                        // always navigate to user for admins
                        // for normal users navigate to 'displayed owner' or user instead
                        isUserAdmin
                          ? `${ROUTES.PROFILE}/${keyframe?.user.uuid}` : (
                            keyframe?.displayedOwner?.uuid
                              ? `${ROUTES.PROFILE}/${keyframe?.displayedOwner?.uuid}`
                              : `${ROUTES.PROFILE}/${keyframe?.user.uuid}`
                          )
                      }
                      options={usersOptions}
                      onInputChange={(newValue) => setUserSearch(newValue)}
                    />
                  )}
                />

                <Input
                  disabled
                  placeholder={t("page.view_keyframe.created")}
                  type="text"
                  before={<FontAwesomeIcon icon={faCalendar} />}
                  value={values.created_at}
                  {...register("created_at")}
                />
              </Column>
            </Row>


          </form>
        </Section>
      </Container>
    </>
  );
};

export default ViewKeyframePage;