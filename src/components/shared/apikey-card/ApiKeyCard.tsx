import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { User } from "@/types/auth.types";
import { Button, Column, Row, Text } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboard,
  faKey,
  faRemove,
} from "@fortawesome/free-solid-svg-icons";
import { APIKEY_QUERY_KEY, useApiKey } from "@/api/user/query/useApiKey";
import { useGenerateApiKey } from "@/api/user/mutation/useGenerateApiKey";
import { useRevokeApiKey } from "@/api/user/mutation/useRevokeApiKey";
import { toast } from "react-toastify";
import queryClient from "@/api/query-client";
import CopyToClipboard from "react-copy-to-clipboard";
import { Tooltip } from "react-tooltip";
import Restricted from "../restricted/restricted";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import { Spinner } from "../spinner/spinner";

type ApiKeyCardProps = {
  user?: User;
};

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({ user }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data, isLoading: isLoadingApiKey } = useApiKey({ uuid: user?.uuid });
  const generateApiKeyMutation = useGenerateApiKey({ uuid: user?.uuid });
  const revokeApiKeyMutation = useRevokeApiKey({ uuid: user?.uuid });

  const handleGenerateApiKey = async () => {
    try {
      const response = await generateApiKeyMutation.mutateAsync();
      if (response?.success) {
        toast.success(
          `${t("components.apikey_card.apikey_successfully_generated")}`,
        );
        await queryClient.refetchQueries([APIKEY_QUERY_KEY]);
      } else {
        toast.error(`${t("components.apikey_card.error_generating_apikey")}`);
      }
    } catch (_) {
      toast.error(`${t("components.apikey_card.error_generating_apikey")}`);
    }
  };

  const handleRevokeApiKey = async () => {
    try {
      const response = await revokeApiKeyMutation.mutateAsync();
      await queryClient.refetchQueries([APIKEY_QUERY_KEY]);
      if (response?.success) {
        toast.success(
          `${t("components.apikey_card.apikey_successfully_revoked")}`,
        );
      } else {
        toast.error(`${t("components.apikey_card.error_revoking_apikey")}`);
      }
    } catch (_) {
      toast.error(`${t("components.apikey_card.error_revoking_apikey")}`);
    }
  };

  const handleCopyClipboard = () => {
    toast.success(t("components.apikey_card.apikey_copied_successfully"));
  };

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
            {t("components.apikey_card.apikey")}
          </Text>
        </Row>
        <Row>
          {isLoadingApiKey ? (
            <Spinner />
          ) : apikey?.apikey ? (
            <CopyToClipboard text={apikey.apikey}>
              <Button
                data-tooltip-id="copy-apikey"
                size="sm"
                onClick={handleCopyClipboard}
                before={<FontAwesomeIcon icon={faClipboard} />}
                mr="3"
              >
                {t("components.apikey_card.copy_apikey")}
                <Tooltip
                  id="copy-apikey"
                  place="right-end"
                  content={t("components.apikey_card.copy_apikey")}
                />
              </Button>
            </CopyToClipboard>
          ) : (
            t("components.apikey_card.no_apikey")
          )}
        </Row>
        <Row>
          <Button
            size="sm"
            before={<FontAwesomeIcon icon={faKey} />}
            onClick={handleGenerateApiKey}
          >
            {t("components.apikey_card.generate_new")}
          </Button>
        </Row>

        <Restricted to={PROFILE_PERMISSIONS.CAN_REVOKE_APIKEY}>
          {apikey?.apikey && (
            <Row>
              <Button
                buttonType="danger"
                size="sm"
                before={<FontAwesomeIcon icon={faRemove} />}
                onClick={handleRevokeApiKey}
              >
                {t("components.apikey_card.revoke")}
              </Button>
            </Row>
          )}
        </Restricted>
      </Column>
    </Row>
  );
};

export default ApiKeyCard;
