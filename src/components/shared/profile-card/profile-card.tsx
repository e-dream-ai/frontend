import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { User } from "types/auth.types";
import { Button } from "../button/button";
import Input from "../input/input";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { AvatarPlaceholder } from "./profile-card.styled";

type ProfileDetailsProps = {
  user?: Omit<User, "token">;
};

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <AvatarPlaceholder mb="2rem">
        <i className="fa fa-user" />
      </AvatarPlaceholder>
      <Text mb="0.5rem" fontSize="1rem" fontWeight={600}>
        {user?.email}
      </Text>
      <Text mb="0.5rem" fontSize="1rem" color={theme.textSecondaryColor}>
        {user?.name ?? "--"}
      </Text>
      <Text
        mb="1rem"
        fontSize="1rem"
        fontStyle="italic"
        color={theme.textSecondaryColor}
      >
        {user?.description ?? "No description"}
      </Text>
    </>
  );
};

type ProfileFormProps = {
  user?: Omit<User, "token">;
};

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <form
    // onSubmit={handleSubmit(onSubmit)}
    >
      <AvatarPlaceholder mb="2rem">
        <i className="fa fa-user" />
      </AvatarPlaceholder>
      <Text mb="0.5rem" fontSize="1rem" fontWeight={600}>
        {user?.email}
      </Text>
      <Input
        placeholder={t("components.profile_card.name")}
        type="text"
        before={<i className="fa fa-user" />}
        // error={errors.name?.message}
        // {...register("name")}
      />
      <Input
        placeholder={t("components.profile_card.description")}
        type="text"
        before={<i className="fa fa-align-justify" />}
        // error={errors.description?.message}
        // {...register("description")}
      />
    </form>
  );
};

type ProfileCardProps = {
  user?: Omit<User, "token">;
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState<boolean>(false);

  const onEnableEditMode = () => setEditMode(true);
  const onDisableEditMode = () => setEditMode(false);

  return (
    <Column mb="2rem" style={{ flex: "auto" }}>
      {editMode ? <ProfileForm user={user} /> : <ProfileDetails user={user} />}
      <Row>
        {editMode ? (
          <>
            <Button mr="1rem" size="sm" onClick={onDisableEditMode}>
              Cancel
            </Button>
            <Button size="sm" onClick={onDisableEditMode}>
              Save
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onEnableEditMode}>
            Edit Profile
          </Button>
        )}
      </Row>
    </Column>
  );
};
