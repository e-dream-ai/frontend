import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { LogoIcon } from "./add-home-screen";
import { useTranslation } from "react-i18next";
import { MdInstallDesktop } from "react-icons/md";

export const AddToDesktopChrome = () => {
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
              e-dream app app functionality. Add it to your home screen to use it.
            </Text>
          </Column>
        </Row>
        <Row separator />

        <Row>
          <Column mx={3}>
            <Text fontSize={4} color={theme.colorSecondary} >
              <MdInstallDesktop />
            </Text>
          </Column>
          <Column>
            <Text color={theme.textPrimaryColor}>Press icon button on the search bar above and then click 'install'
            </Text>
          </Column>
        </Row>

      </Column>
    </Row>
  );
}