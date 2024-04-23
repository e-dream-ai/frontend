import { yupResolver } from "@hookform/resolvers/yup";
import queryClient from "@/api/query-client";
import { useUpdateUser } from "@/api/user/mutation/useUpdateUser";
import { useUpdateUserAvatar } from "@/api/user/mutation/useUpdateUserAvatar";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import { ROLES_NAMES } from "@/constants/role.constants";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { faAlignJustify, faUser } from "@fortawesome/free-solid-svg-icons";
import { getUserEmail, getUserName } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";

type ProfileDetailsProps = {
  user?: Omit<User, "token">;
};

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const avatarUrl = useImage(user?.avatar, {
    width: 142,
    fit: "cover",
  });

  return (
    <>
      <Row mb="2rem">
        <Avatar size="lg" url={avatarUrl} />
      </Row>
      <Text fontSize="1rem" color={theme.colorPrimary}>
        {t(ROLES_NAMES[user?.role?.name ?? ""]) ?? "-"}
      </Text>
      <Text mb="0.5rem" fontSize="1rem" color={theme.textSecondaryColor}>
        {getUserName(user) ?? "-"}
      </Text>
      {Boolean(user?.email) && (
        <Text mb="0.5rem" fontSize="1rem" color={theme.textPrimaryColor}>
          {getUserEmail(user) ?? "-"}
        </Text>
      )}
      <Text
        mb="1rem"
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
    </>
  );
};

type ProfileFormProps = {
  user?: Omit<User, "token">;
  onDisableEditMode: () => void;
};

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onDisableEditMode,
}) => {
  const { t } = useTranslation();
  const { isLoading: isLoadingUpdateUser, mutate: mutateUpdateUser } =
    useUpdateUser({ id: user?.id });
  const { isLoading: isLoadingUpdateAvatar, mutate: mutateUpdateAvatar } =
    useUpdateUserAvatar({ id: user?.id });

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
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(ProfileSchema),
    values: { name: user?.name ?? "", description: user?.description ?? "" },
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
    mutateUpdateUser(formData, {
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
    });
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
      <Text mb="0.5rem" fontSize="1rem" fontWeight={600}>
        {user?.email}
      </Text>
      <Input
        placeholder={t("components.profile_card.name")}
        type="text"
        before={<FontAwesomeIcon icon={faUser} />}
        error={errors.name?.message}
        {...register("name")}
      />
      <TextArea
        placeholder={t("components.profile_card.description")}
        before={<FontAwesomeIcon icon={faAlignJustify} />}
        error={errors.description?.message}
        {...register("description")}
      />
      <Row>
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
