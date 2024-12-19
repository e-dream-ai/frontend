import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { LogoIcon } from "./add-home-screen";
import { useTranslation } from "react-i18next";
import Anchor from "../anchor/anchor";

export const AddToOtherBrowser = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const searchUrl = `https://www.google.com/search?q=add+to+home+screen+for+common-mobile-browsers`;

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
          <Column>
            <Text color={theme.textPrimaryColor}>Unfortunately, we were unable to determine which browser you are using. Please search for how to install a web app for your browser.
            </Text>
            <Anchor className="text-blue-300" href={searchUrl} target='_blank'>Try This Search</Anchor>
          </Column>
        </Row>
      </Column>
    </Row>
  );
}