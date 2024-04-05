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

const SECTION_ID = "my-profile";

type ProfileProps = {
  isMyProfile?: boolean;
};

const Profile: React.FC<ProfileProps> = ({ isMyProfile }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMyProfilePage =
    isMyProfile || location.pathname.includes(ROUTES.MY_PROFILE);
  const { id } = useParams<{ id: string }>();
  const paramId = Number(id) || 0;
  const { user: authUser } = useAuth();
  const userId = isMyProfilePage ? authUser?.id : paramId;
  const { data } = useUser({ id: userId });
  const user = data?.data?.user;

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
          </LeftProfilePage>
          <RightProfilePage>
            {isMyProfile && (
              <>
                <Text mb="1rem" fontSize="1rem" fontWeight={600}>
                  {t("page.profile.current_dream")}
                </Text>
                <CurrentDream user={user} uuid={user?.currentDream?.uuid} />

                <Text mb="1rem" fontSize="1rem" fontWeight={600}>
                  {t("page.profile.current_playlist")}
                </Text>
                <CurrentPlaylist user={user} id={user?.currentPlaylist?.id} />

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
              <UserDreams userId={userId} grid />
            </Row>
          </RightProfilePage>
        </ProfilePageContainer>
      </Section>
    </Container>
  );
};

export default Profile;
