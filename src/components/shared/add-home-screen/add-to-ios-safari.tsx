import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { LogoIcon } from "./add-home-screen";
import { useTranslation } from "react-i18next";

export const AddToIosSafari = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Row>
      <Column>
        <Row m={0}>
          <Column m={3} justifyContent="center">
            <LogoIcon
              src="/images/edream-logo-512x512.png"
              alt={t("header.e_dream")}
            />
          </Column>
          <Column justifyContent="center">
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.app_functionality_description")}
            </Text>
          </Column>
        </Row>
        <Row separator />

        <Row>
          <Column>
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.install_message")}
            </Text>
          </Column>
        </Row>
      </Column>
    </Row>
  );
};
