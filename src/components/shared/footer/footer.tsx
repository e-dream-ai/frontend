import { Anchor } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";
import router from "@/routes/router";
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

const FooterIcons: React.FC = () => (
  <>
    <Anchor href="https://www.threads.net/@e_dream_ai" target="_blank">
      <span className="fa-stack fa-lg --fa-li-margin">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faThreads}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor href="https://twitter.com/e_dream_ai" target="_blank">
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faTwitter}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor href="https://discord.gg/FFDTWwBgBe" target="_blank">
      <span className="fa-stack fa-lg">
        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
        <FontAwesomeIcon
          icon={faDiscord}
          className="fa-stack-1x fa-inverse reverse"
        />
      </span>
    </Anchor>
    <Anchor
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
    <Anchor href="https://www.facebook.com/groups/edreamai/" target="_blank">
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

  return (
    <StyledFooter id="footer">
      <FooterRow>
        <FooterCol flow="column">
          <div>
            <Anchor onClick={() => router.navigate(ROUTES.TERMS_OF_SERVICE)}>
              {t("footer.terms_of_service")}
            </Anchor>
          </div>
        </FooterCol>
        <FooterCol>
          <FooterIcons />
        </FooterCol>
        <FooterCol>
          <p>© Spotworks, LLC</p>
        </FooterCol>
      </FooterRow>
    </StyledFooter>
  );
};
