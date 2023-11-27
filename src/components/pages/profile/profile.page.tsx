import { useUser } from "api/user/query/useUser";
import { Row } from "components/shared";
import Container from "components/shared/container/container";
import MyDreams from "components/shared/my-dreams/my-dreams";
import { ProfileCard } from "components/shared/profile-card/profile-card";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { ROUTES } from "constants/routes.constants";
import useAuth from "hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import {
  LeftProfilePage,
  ProfilePageContainer,
  RightProfilePage,
} from "./profile.styled";

const SECTION_ID = "my-profile";

const Profile = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMyProfilePage = location.pathname.includes(ROUTES.MY_PROFILE);
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const { data } = useUser({ id: isMyProfilePage ? authUser?.id : id });
  const user = data?.data?.user;

  return (
    <Container>
      <h2>{t("page.profile.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <ProfilePageContainer>
          <LeftProfilePage>
            <ProfileCard user={user} />
          </LeftProfilePage>
          <RightProfilePage>
            <Text mb="1rem" fontSize="1rem" fontWeight={600}>
              {t("page.profile.dreams")}
            </Text>
            <MyDreams />
          </RightProfilePage>
        </ProfilePageContainer>
      </Section>
    </Container>
  );
};

export default Profile;
