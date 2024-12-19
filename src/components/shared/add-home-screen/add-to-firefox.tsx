import { useTheme } from "styled-components";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import { HiDotsVertical } from 'react-icons/hi';
import { MdAddToHomeScreen } from 'react-icons/md';
import { LogoIcon } from "./add-home-screen";
import { useTranslation } from "react-i18next";

export const AddToFirefox = () => {
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
              <HiDotsVertical />
            </Text>
          </Column>
          <Column>
            <Text color={theme.textPrimaryColor}>Press the 'Share' button on the menu bar below
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
              Press 'Add to Home Screen'
            </Text>
          </Column>
        </Row>
      </Column>
    </Row>
  );
}