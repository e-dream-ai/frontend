import { yupResolver } from "@hookform/resolvers/yup";
import queryClient from "@/api/query-client";
import { useUpdateUser } from "@/api/user/mutation/useUpdateUser";
import { useUpdateUserAvatar } from "@/api/user/mutation/useUpdateUserAvatar";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import { ROLES_NAMES } from "@/constants/role.constants";
import useAuth from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Linkify from "react-linkify";
import { toast } from "react-toastify";
import ProfileSchema, { ProfileFormValues } from "@/schemas/profile.schema";
import { useTheme } from "styled-components";
import { User } from "@/types/auth.types";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import Anchor from "../anchor/anchor";
import { AvatarUploader } from "../avatar-uploader/avatar-uploader";
import { Button } from "../button/button";
import Input from "../input/input";
import Restricted from "../restricted/restricted";
import Row, { Column } from "../row/row";
import TextArea from "../text-area/text-area";
import Text from "../text/text";
import { Avatar } from "@/components/shared/avatar/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignJustify,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { formatRoleName, getUserEmail, getUserName } from "@/utils/user.util";
import Select from "@/components/shared/select/select";
import { useRoles } from "@/api/user/query/useRoles";
import { useImage } from "@/hooks/useImage";
import {
  NSFW,
  filterNsfwOption,
  getNsfwOptions,
} from "@/constants/dream.constants";
import usePermission from "@/hooks/usePermission";

type ProfileDetailsProps = {
  user?: Omit<User, "token">;
};

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: authUser } = useAuth();

  const isOwner: boolean = useMemo(
    () => user?.id === authUser?.id,
    [user, authUser],
  );

  const allowedViewRestrictedInfo = usePermission({
    permission: PROFILE_PERMISSIONS.CAN_VIEW_RESTRICTED_INFO,
    isOwner,
  });

  const avatarUrl = useImage(user?.avatar, {
    width: 142,
    fit: "cover",
  });

  return (
    <>
      <Row mb="2rem">
        <Avatar size="lg" url={avatarUrl} />
      </Row>

      <Text mb={2} fontSize="1.2rem" color={theme.textPrimaryColor}>
        {getUserName(user) ?? "-"}
      </Text>

      <Row my={1}>{t("components.profile_card.role")}</Row>
      <Text mb={2} fontSize="1rem" color={theme.textSecondaryColor}>
        {t(ROLES_NAMES[user?.role?.name ?? ""]) ?? "-"}
      </Text>

      <Row my={1}>{t("components.profile_card.description")}</Row>
      <Row>
        <Text
          fontSize="1rem"
          fontStyle="italic"
          color={theme.textSecondaryColor}
        >
          <Linkify
            componentDecorator={(decoratedHref, decoratedText, key) => (
              <Anchor target="_blank" href={decoratedHref} key={key}>
                {decoratedText}
              </Anchor>
            )}
          >
            {user?.description ?? t("components.profile_card.no_description")}
          </Linkify>
        </Text>
      </Row>

      {allowedViewRestrictedInfo && (
        <>
          <Row my={1}>{t("components.profile_card.email")}</Row>
          <Row>
            <Text fontSize="1rem" color={theme.textSecondaryColor}>
              {getUserEmail(user) ?? "-"}
            </Text>
          </Row>

          <Row my={3}>
            <Text
              fontSize="1rem"
              color={theme.textPrimaryColor}
              style={{ textTransform: "uppercase", fontStyle: "italic" }}
            >
              {t("components.profile_card.settings")}
            </Text>
          </Row>

          <Row my={1}>{t("components.profile_card.nsfw")}</Row>
          <Row>
            <Text fontSize="1rem" mb={2} color={theme.textSecondaryColor}>
              {user?.nsfw ? t("user.nsfw.nsfw") : t("user.nsfw.sfw")}
            </Text>
          </Row>
        </>
      )}
    </>
  );
};

type ProfileFormProps = {
  user?: User;
  onDisableEditMode: () => void;
};

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onDisableEditMode,
}) => {
  const { t } = useTranslation();
  const [roleSearch, setRoleSearch] = useState<string>("");
  const theme = useTheme();

  const { isLoading: isLoadingUpdateUser, mutate: mutateUpdateUser } =
    useUpdateUser({ id: user?.id });
  const { isLoading: isLoadingUpdateAvatar, mutate: mutateUpdateAvatar } =
    useUpdateUserAvatar({ id: user?.id });

  const { data: rolesData, isLoading: isRolesLoading } = useRoles({
    search: roleSearch,
  });

  const rolesOptions = (rolesData?.data?.roles ?? [])
    .filter((role) => role.name)
    .map((role) => ({
      label: formatRoleName(role?.name),
      value: role?.id,
    }));

  const isLoading = isLoadingUpdateUser || isLoadingUpdateAvatar;
  const [avatar, setAvatar] = useState<MultiMediaState>();

  const avatarUrl = useImage(user?.avatar, {
    width: 142,
    fit: "cover",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(ProfileSchema),
    values: {
      name: user?.name ?? "",
      description: user?.description ?? "",
      role: user?.role
        ? {
            value: user.role?.id,
            label: formatRoleName(user?.role?.name),
          }
        : {},
      nsfw: filterNsfwOption(user?.nsfw, t),
    },
  });

  const handleAvatarChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setAvatar({ file: files, url: URL.createObjectURL(files) });
    }
  };

  const handleMutateUpdateAvatar = (formData: ProfileFormValues) => {
    if (avatar?.file) {
      mutateUpdateAvatar(
        { file: avatar?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutateUpdateUser(formData);
            } else {
              toast.error(
                `${t("components.profile_card.error_updating_profile")} ${
                  response.message
                }`,
              );
            }
          },
          onError: () => {
            toast.error(t("components.profile_card.error_updating_profile"));
          },
        },
      );
    } else {
      handleMutateUpdateUser(formData);
    }
  };

  const handleMutateUpdateUser = (formData: ProfileFormValues) => {
    mutateUpdateUser(
      {
        name: formData?.name,
        description: formData?.description,
        role: formData?.role?.value,
        nsfw: formData?.nsfw.value === NSFW.TRUE,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            queryClient.setQueryData([USER_QUERY_KEY, user?.id], response);
            toast.success(
              `${t("components.profile_card.profile_successfully_updated")}`,
            );
            setAvatar(undefined);
            onDisableEditMode();
            reset();
          } else {
            toast.error(
              `${t("components.profile_card.error_updating_profile")} ${
                response.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("components.profile_card.error_updating_profile"));
        },
      },
    );
  };

  const onSubmit = (formData: ProfileFormValues) => {
    handleMutateUpdateAvatar(formData);
  };

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
      <Row mb="2rem">
        <AvatarUploader
          handleChange={handleAvatarChange}
          src={avatar?.url ? avatar?.url : avatarUrl}
          types={["JPG", "JPEG"]}
        />
      </Row>
      <Input
        placeholder={t("components.profile_card.name")}
        type="text"
        before={<FontAwesomeIcon icon={faUser} />}
        error={errors.name?.message}
        {...register("name")}
      />
      <Restricted to={PROFILE_PERMISSIONS.CAN_EDIT_ROLE}>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("components.profile_card.role")}
              isLoading={isRolesLoading}
              before={<FontAwesomeIcon icon={faUser} />}
              options={rolesOptions}
              onInputChange={(newValue) => setRoleSearch(newValue)}
            />
          )}
        />
      </Restricted>

      <TextArea
        placeholder={t("components.profile_card.description")}
        before={<FontAwesomeIcon icon={faAlignJustify} />}
        error={errors.description?.message}
        {...register("description")}
      />

      <Row my={3}>
        <Text
          fontSize="1rem"
          color={theme.textPrimaryColor}
          style={{ textTransform: "uppercase", fontStyle: "italic" }}
        >
          {t("components.profile_card.settings")}
        </Text>
      </Row>

      <Controller
        name="nsfw"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            placeholder={t("components.profile_card.nsfw")}
            before={<FontAwesomeIcon icon={faShield} />}
            options={getNsfwOptions(t)}
          />
        )}
      />

      <Row mt={2}>
        <Button
          type="button"
          mr="1rem"
          size="sm"
          disabled={isLoading}
          onClick={onDisableEditMode}
        >
          {t("components.profile_card.cancel")}
        </Button>
        <Button type="submit" isLoading={isLoading} size="sm">
          {t("components.profile_card.save")}
        </Button>
      </Row>
    </form>
  );
};

type ProfileCardProps = {
  user?: Omit<User, "token">;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [editMode, setEditMode] = useState<boolean>(false);

  const onEnableEditMode = () => setEditMode(true);
  const onDisableEditMode = () => setEditMode(false);

  return (
    <Row mb="2rem" mr="1rem">
      <Column>
        {editMode ? (
          <ProfileForm user={user} onDisableEditMode={onDisableEditMode} />
        ) : (
          <ProfileDetails user={user} />
        )}
        {!editMode && (
          <Restricted
            to={PROFILE_PERMISSIONS.CAN_EDIT_PROFILE}
            isOwner={authUser?.id === user?.id}
          >
            <Row>
              <Button size="sm" onClick={onEnableEditMode}>
                {t("components.profile_card.edit_profile")}
              </Button>
            </Row>
          </Restricted>
        )}
      </Column>
    </Row>
  );
};
