import { User } from "@/types/auth.types";
import { Button, Column, Row, Text } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faRemove } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";
import { useApiKey } from "@/api/user/query/useApiKey";

type ApiKeyCardProps = {
  user?: Omit<User, "token">;
};

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({ user }) => {
  const theme = useTheme();
  const { data } = useApiKey({ id: user?.id });
  const apikey = data?.data?.apikey;
  return (
    <Row mb="2rem" mr="1rem">
      <Column>
        <Row>
          <Text
            fontSize="1rem"
            color={theme.textPrimaryColor}
            style={{ textTransform: "uppercase", fontStyle: "italic" }}
          >
            ApiKey
          </Text>
        </Row>
        <Row>
          <Text color={theme.textBodyColor}>
            {apikey?.apikey ?? "no apikey generated"}
          </Text>
        </Row>
        <Row>
          <Button
            size="sm"
            before={<FontAwesomeIcon icon={faKey} />}
            //   onClick={onClick}
          >
            Generate new
          </Button>
        </Row>
        <Row>
          <Button
            size="sm"
            before={<FontAwesomeIcon icon={faRemove} />}
            //   onClick={onClick}
          >
            Revoke
          </Button>
        </Row>
      </Column>
    </Row>
  );
};

export default ApiKeyCard;
