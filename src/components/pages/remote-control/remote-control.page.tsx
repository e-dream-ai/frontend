import { useUser } from "@/api/user/query/useUser";
import { Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { RemoteControl } from "@/components/shared/remote-control/remote-control";
import { CurrentDream } from "@/components/shared/current-dream/current-dream";
import { CurrentPlaylist } from "@/components/shared/current-playlist/current-playlist";
import { NotFound } from "@/components/shared/not-found/not-found";
import { Spinner } from "@/components/shared/spinner/spinner";

const SECTION_ID = "remote-control";

const RemoteControlPage: React.FC = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const userUUID = authUser?.uuid;

  const {
    data,
    isError,
    isLoading: isUserLoading,
  } = useUser({ uuid: userUUID });
  const user = data?.data?.user;

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
      <h2>{t("page.remote_control.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />

        <Row justifyContent="center" my="2rem">
          <RemoteControl />
        </Row>

        <CurrentDream user={user} uuid={user?.currentDream?.uuid} />

        <CurrentPlaylist user={user} uuid={user?.currentPlaylist?.uuid} />
      </Section>
    </Container>
  );
};

export default RemoteControlPage;
