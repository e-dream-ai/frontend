import { Anchor } from "components/shared";
import Container from "components/shared/container/container";
import Text from "components/shared/text/text";
import { ROUTES } from "constants/routes.constants";
import { useNavigate } from "react-router-dom";

export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const handleGoHome = () => navigate(ROUTES.ROOT);
  return (
    <Container>
      <h2>404 Not Found </h2>
      <>
        <Text>Page not found, </Text>
        <Anchor onClick={handleGoHome}>go home</Anchor>
      </>
    </Container>
  );
};

export default ErrorPage;
