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
import ProfileSchema, {
  ProfileFormRequest,
  ProfileFormValues,
} from "@/schemas/profile.schema";
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
  faHardDrive,
  faMailBulk,
  faPencil,
  faSave,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatRoleName,
  getUserEmail,
  getUserName,
  isAdmin,
} from "@/utils/user.util";
import Select from "@/components/shared/select/select";
import { useRoles } from "@/api/user/query/useRoles";
import { useImage } from "@/hooks/useImage";
import {
  NSFW,
  filterNsfwOption,
  getNsfwOptions,
} from "@/constants/dream.constants";
import usePermission from "@/hooks/usePermission";
import { formatDateToYYYYMMDD } from "@/utils/date.util";
import {
  ENABLE_MARKETING_EMAILS,
  filterMarketingEmailOption,
  getEnableMarketingEmailsOptions,
} from "@/constants/user.constants";
import { bytesToGB, GBToBytes } from "@/utils/file.util";
import { toFixedNumber } from "@/utils/number.util";
import { ALLOWED_IMAGE_TYPES } from "@/constants/file.constants";
import ApiKeyCard from "../apikey-card/ApiKeyCard";

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
    <Row flexWrap="wrap">
      <Column flex={["0 0 100%", "0 0 50%"]} alignItems="center">
        <Avatar size="lg" url={avatarUrl} />
      </Column>

      <Column flex={["0 0 100%", "0 0 50%"]}>
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
                <Anchor
                  target="_blank"
                  type="secondary"
                  href={decoratedHref}
                  key={key}
                >
                  {decoratedText}
                </Anchor>
              )}
            >
              {user?.description ?? t("components.profile_card.no_description")}
            </Linkify>
          </Text>
        </Row>

        <Restricted to={PROFILE_PERMISSIONS.CAN_VIEW_QUOTA}>
          <Row my={1}>{t("components.profile_card.quota")}</Row>
          <Text mb={2} fontSize="1rem" color={theme.textSecondaryColor}>
            {user?.quota
              ? `${toFixedNumber(bytesToGB(user.quota), 2)} ${t("units.gb")}`
              : "-"}
          </Text>
        </Restricted>

        {allowedViewRestrictedInfo && (
          <>
            <Row my={1}>{t("components.profile_card.email")}</Row>
            <Row>
              <Text fontSize="1rem" color={theme.textSecondaryColor}>
                {getUserEmail(user) ?? "-"}
              </Text>
            </Row>
            <Row my={1}>{t("components.profile_card.signup_code")}</Row>
            <Row>
              <Text fontSize="1rem" color={theme.textSecondaryColor}>
                {user?.signupInvite?.code ?? "-"}
              </Text>
            </Row>
            <Row my={1}>{t("components.profile_card.last_login")}</Row>
            <Row>
              <Text fontSize="1rem" color={theme.textSecondaryColor}>
                {user?.last_login_at
                  ? formatDateToYYYYMMDD(new Date(user?.last_login_at))
                  : "-"}
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

            <Row my={1}>{t("components.profile_card.marketing_emails")}</Row>
            <Row>
              <Text fontSize="1rem" mb={2} color={theme.textSecondaryColor}>
                {user?.enableMarketingEmails
                  ? t("user.marketing_emails.active")
                  : t("user.marketing_emails.inactive")}
              </Text>
            </Row>
          </>
        )}
      </Column>
    </Row>
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
  const { user: authUser } = useAuth();
  const theme = useTheme();
  const isUserAdmin = useMemo(() => isAdmin(authUser as User), [authUser]);
  const [roleSearch, setRoleSearch] = useState<string>("");

  const { isLoading: isLoadingUpdateUser, mutate: mutateUpdateUser } =
    useUpdateUser({ uuid: user?.uuid });
  const { isLoading: isLoadingUpdateAvatar, mutate: mutateUpdateAvatar } =
    useUpdateUserAvatar({ uuid: user?.uuid });

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
      enableMarketingEmails: filterMarketingEmailOption(
        user?.enableMarketingEmails,
        t,
      ),
      quota: user?.quota ? toFixedNumber(bytesToGB(user.quota), 2) : 0,
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
    const data: ProfileFormRequest = {
      name: formData?.name,
      description: formData?.description,
      role: formData?.role?.value,
      nsfw: formData?.nsfw.value === NSFW.TRUE,
      enableMarketingEmails:
        formData?.enableMarketingEmails.value === ENABLE_MARKETING_EMAILS.TRUE,
      quota:
        formData?.quota !== undefined
          ? Math.round(GBToBytes(formData.quota))
          : undefined,
    };

    if (!isUserAdmin) {
      delete data.quota;
    }

    mutateUpdateUser(data, {
      onSuccess: (response) => {
        if (response.success) {
          queryClient.setQueryData([USER_QUERY_KEY, user?.uuid], response);
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
    });
  };

  const onSubmit = (formData: ProfileFormValues) => {
    handleMutateUpdateAvatar(formData);
  };

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
      <Row justifyContent="flex-end">
        <Button
          type="button"
          mr="1rem"
          disabled={isLoading}
          onClick={onDisableEditMode}
        >
          {t("components.profile_card.cancel")}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          after={<FontAwesomeIcon icon={faSave} />}
        >
          {t("components.profile_card.save")}
        </Button>
      </Row>
      <Row mb="2rem" flexWrap="wrap">
        <Column flex={["0 0 100%", "0 0 50%"]} alignItems="center" mb={4}>
          <AvatarUploader
            handleChange={handleAvatarChange}
            src={avatar?.url ? avatar?.url : avatarUrl}
            types={ALLOWED_IMAGE_TYPES}
          />
        </Column>
        <Column flex={["0 0 100%", "0 0 50%"]}>
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

          <Restricted to={PROFILE_PERMISSIONS.CAN_VIEW_QUOTA}>
            <Input
              placeholder={t("components.profile_card.quota_placeholder")}
              type="text"
              before={<FontAwesomeIcon icon={faHardDrive} />}
              error={errors.quota?.message}
              {...register("quota")}
            />
          </Restricted>

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

          <Controller
            name="enableMarketingEmails"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={t("components.profile_card.marketing_emails")}
                before={<FontAwesomeIcon icon={faMailBulk} />}
                options={getEnableMarketingEmailsOptions(t)}
              />
            )}
          />
        </Column>
      </Row>
    </form>
  );
};

type ProfileCardProps = {
  user?: Omit<User, "token">;
  showApiKeyCard?: boolean;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  showApiKeyCard,
}) => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [editMode, setEditMode] = useState<boolean>(false);

  const onEnableEditMode = () => setEditMode(true);
  const onDisableEditMode = () => setEditMode(false);

  return (
    <>
      <Row mb="2rem">
        <Column flex="auto">
          {!editMode && (
            <Restricted
              to={PROFILE_PERMISSIONS.CAN_EDIT_PROFILE}
              isOwner={authUser?.id === user?.id}
            >
              <Row justifyContent="flex-end">
                <Button
                  size="md"
                  onClick={onEnableEditMode}
                  after={<FontAwesomeIcon icon={faPencil} />}
                >
                  {t("components.profile_card.edit_profile")}
                </Button>
              </Row>
            </Restricted>
          )}
          <Column flex="auto">
            {editMode ? (
              <ProfileForm user={user} onDisableEditMode={onDisableEditMode} />
            ) : (
              <ProfileDetails user={user} />
            )}
          </Column>
        </Column>
      </Row>
      {!editMode && showApiKeyCard && (
        <Row flexWrap="wrap">
          <Column flex={["0 0 100%", "0 0 50%"]}></Column>
          <Column flex={["0 0 100%", "0 0 50%"]}>
            <ApiKeyCard user={user} />
          </Column>
        </Row>
      )}
    </>
  );
};
