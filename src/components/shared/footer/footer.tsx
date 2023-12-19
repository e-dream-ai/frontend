import { Anchor } from "components/shared";
import { ROUTES } from "constants/routes.constants";
import { useTranslation } from "react-i18next";
import router from "routes/router";
import { FooterCol, FooterRow, StyledFooter } from "./footer.styled";

const FooterIcons: React.FC = () => (
  <>
    <Anchor href="https://www.facebook.com/groups/edreamai/" target="_blank">
      <span className="fa-stack fa-lg">
        <i className="fa fa-circle fa-stack-2x" />
        <i className="fa fa-facebook fa-stack-1x fa-inverse reverse" />
      </span>
    </Anchor>
    <Anchor href="https://www.threads.net/@e_dream_ai" target="_blank">
      <span className="fa-stack fa-lg">
        <i className="fa fa-circle fa-stack-2x" />
        <i className="fa fa-threads fa-stack-1x fa-inverse reverse" />
      </span>
    </Anchor>
    <Anchor href="https://twitter.com/e_dream_ai" target="_blank">
      <span className="fa-stack fa-lg">
        <i className="fa fa-circle fa-stack-2x" />
        <i className="fa fa-twitter fa-stack-1x fa-inverse reverse" />
      </span>
    </Anchor>
    <Anchor
      href="https://github.com/e-dream-ai/client"
      target="_blank"
      rel="noreferrer"
    >
      <span className="fa-stack fa-lg">
        <i className="fa fa-circle fa-stack-2x" />
        <i className="fa fa-github fa-stack-1x fa-inverse reverse" />
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
