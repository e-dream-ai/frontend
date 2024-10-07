import { useUser } from "@/api/user/query/useUser";
import { Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { ProfileCard } from "@/components/shared/profile-card/profile-card";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import UserDreams from "@/components/shared/user-dreams/user-dreams";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import {
  LeftProfilePage,
  ProfilePageContainer,
  RightProfilePage,
} from "./profile.styled";
import { RemoteControl } from "@/components/shared/remote-control/remote-control";
import { CurrentDream } from "@/components/shared/current-dream/current-dream";
import { CurrentPlaylist } from "@/components/shared/current-playlist/current-playlist";
import ApiKeyCard from "@/components/shared/apikey-card/ApiKeyCard";
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
  const { user: loggedUser } = useAuth();
  const isMyProfilePage =
    isMyProfile || location.pathname.includes(ROUTES.MY_PROFILE);
  const isLoggedUserAdmin = useMemo(
    () => isAdmin(loggedUser as User),
    [loggedUser],
  );
  const { uuid } = useParams<{ uuid: string }>();
  const { user: authUser } = useAuth();
  const userUUID = isMyProfilePage ? authUser?.uuid : uuid;
  const { data, isError, isLoading: isUserLoading } = useUser({ uuid: userUUID });
  const user = data?.data?.user;
  const showApiKeyCard = isMyProfilePage || isLoggedUserAdmin;

  if (isUserLoading) {
    return (
      <Row justifyContent="center">
        <Spinner />
      </Row>
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
          <LeftProfilePage>
            <ProfileCard user={user} />
            {showApiKeyCard && <ApiKeyCard user={user} />}
          </LeftProfilePage>
          <RightProfilePage>
            {isMyProfile && (
              <>
                <CurrentDream user={user} uuid={user?.currentDream?.uuid} />

                <CurrentPlaylist
                  user={user}
                  uuid={user?.currentPlaylist?.uuid}
                />

                <Text mb="1rem" fontSize="1rem" fontWeight={600}>
                  {t("page.profile.remote_control")}
                </Text>
                <RemoteControl />
              </>
            )}

            <Text mb="1rem" fontSize="1rem" fontWeight={600}>
              {t("page.profile.dreams")}
            </Text>
            <Row>
              <UserDreams
                key={Boolean(user?.nsfw).toString()}
                userUUID={userUUID}
                columns={2}
                grid
              />
            </Row>
          </RightProfilePage>
        </ProfilePageContainer>
      </Section>
    </Container>
  );
};

export default Profile;
