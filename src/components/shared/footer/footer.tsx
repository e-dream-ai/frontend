import { Anchor, AnchorLink, Column, Row, Text } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";
import { FooterCol, FooterRow, StyledFooter } from "./footer.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faFacebookF,
  faGithub,
  faThreads,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "styled-components";

const FooterIcons: React.FC = () => (
  <>
    <Anchor
      type="secondary"
      href="https://www.threads.net/@e_dream_ai"
      target="_blank"
    >
      <span className="fa-stack fa-lg --fa-li-margin">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faThreads}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor
      type="secondary"
      href="https://twitter.com/e_dream_ai"
      target="_blank"
    >
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faTwitter}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor
      type="secondary"
      href="https://discord.gg/FFDTWwBgBe"
      target="_blank"
    >
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faDiscord}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor
      type="secondary"
      href="https://github.com/e-dream-ai/client"
      target="_blank"
      rel="noreferrer"
    >
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faGithub}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor
      type="secondary"
      href="https://www.facebook.com/groups/edreamai/"
      target="_blank"
    >
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faFacebookF}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
  </>
);

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <StyledFooter id="footer">
      <FooterRow>
        <FooterCol flow="column">
          <div>
            <AnchorLink type="secondary" to={ROUTES.TERMS_OF_SERVICE}>
              {t("footer.terms_of_service")}
            </AnchorLink>
          </div>
        </FooterCol>
        <FooterCol>
          <FooterIcons />
        </FooterCol>
        <FooterCol>
          <Column>
            <Row justifyContent="center" mb="0">
              <Text fontSize="0.8rem" color={theme.colorPrimary}>
                <p>© e-dream, inc</p>
              </Text>
            </Row>
            <Row justifyContent="center" mb="0">
              <Text fontSize="0.6rem" color={theme.textBodyColor}>
                {import.meta.env.VITE_COMMIT_REF || ""}{" "}
                {import.meta.env.VITE_BRANCH || ""}{" "}
                {import.meta.env.VITE_BUILD_DATE || ""}
              </Text>
            </Row>
          </Column>
        </FooterCol>
      </FooterRow>
    </StyledFooter>
  );
};
