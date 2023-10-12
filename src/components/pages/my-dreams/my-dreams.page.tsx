import { useMyDreams } from "api/dream/query/useMyDreams";
import { Anchor } from "components/shared";
import Container from "components/shared/container/container";
import { ROUTES } from "constants/routes.constants";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useMyDreams();
  const dreams = data?.data?.dreams;

  const navigateToDream = (uuid: string) => () =>
    navigate(`${ROUTES.VIEW_DREAM}/${uuid}`);

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <section>
        <ul>
          {dreams?.map(({ uuid, name }) => (
            <li key={uuid}>
              <Anchor onClick={navigateToDream(uuid)}>
                {name || "Unnamed dream"} - {uuid}
              </Anchor>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
};

export default MyDreamsPage;
