import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { HiDotsVertical } from "react-icons/hi";
import { MdAddToHomeScreen } from "react-icons/md";
import { LogoIcon } from "./add-home-screen";
import { useTranslation } from "react-i18next";

export const AddToMobileChrome = () => {
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
          <Column mx={3}>
            <Text fontSize={4} color={theme.colorSecondary}>
              <HiDotsVertical />
            </Text>
          </Column>
          <Column>
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.mobile_chrome_step1")}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column mx={3}>
            <Text fontSize={4} color={theme.colorSecondary}>
              <MdAddToHomeScreen />
            </Text>
          </Column>

          <Column>
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.mobile_chrome_step2")}
            </Text>
          </Column>
        </Row>

        <Row mt={3} justifyContent="center">
          <img
            src="/pwa/android.png"
            alt="Android Chrome installation guide"
            style={{ maxWidth: "100%", height: "300px", borderRadius: "8px" }}
          />
        </Row>
      </Column>
    </Row>
  );
};
