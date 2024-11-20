import { useUser } from "@/api/user/query/useUser";
import { Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { ProfileCard } from "@/components/shared/profile-card/profile-card";
import { Section } from "@/components/shared/section/section";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { ProfilePageContainer } from "./profile.styled";

import { useMemo } from "react";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";
import { NotFound } from "@/components/shared/not-found/not-found";
import { Spinner } from "@/components/shared/spinner/spinner";

const SECTION_ID = "my-profile";

type ProfileProps = {
  isMyProfile?: boolean;
};

const Profile: React.FC<ProfileProps> = ({ isMyProfile }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const isMyProfilePage =
    isMyProfile || location.pathname.includes(ROUTES.MY_PROFILE);
  const isLoggedUserAdmin = useMemo(
    () => isAdmin(authUser as User),
    [authUser],
  );
  const { uuid } = useParams<{ uuid: string }>();
  const userUUID = isMyProfilePage ? authUser?.uuid : uuid;
  const {
    data,
    isError,
    isLoading: isUserLoading,
  } = useUser({ uuid: userUUID });
  const user = data?.data?.user;
  const showApiKeyCard = isMyProfilePage || isLoggedUserAdmin;

  if (isUserLoading) {
    return (
      <Container>
        <Row justifyContent="center">
          <Spinner />
        </Row>
      </Container>
    );
  }

  if (isError) {
    return <NotFound />;
  }

  return (
    <Container>
      <h2>
        {isMyProfilePage
          ? t("page.profile.my_profile")
          : t("page.profile.title")}
      </h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <ProfilePageContainer>
          <ProfileCard user={user} showApiKeyCard={showApiKeyCard} />
        </ProfilePageContainer>
      </Section>
    </Container>
  );
};

export default Profile;
