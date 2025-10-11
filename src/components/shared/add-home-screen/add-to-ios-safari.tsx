import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { TbShare2 } from "react-icons/tb";
import { AiOutlinePlusSquare } from "react-icons/ai";
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
          <Column mx={3}>
            <Text fontSize={4} color={theme.colorSecondary}>
              <TbShare2 />
            </Text>
          </Column>
          <Column>
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.mobile_ios_safari_step1")}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column mx={3}>
            <Text fontSize={4} color={theme.colorSecondary}>
              <AiOutlinePlusSquare />
            </Text>
          </Column>

          <Column>
            <Text color={theme.textPrimaryColor}>
              {t("modal.add_home_screen.mobile_ios_safari_step2")}
            </Text>
          </Column>
        </Row>

        <Row mt={3} justifyContent="center">
          <img
            src="/pwa/ios.png"
            alt="iOS Safari installation guide"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Row>
      </Column>
    </Row>
  );
};
