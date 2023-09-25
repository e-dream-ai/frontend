import { Anchor } from "components/shared";
import { FooterCol, FooterRow, StyledFooter } from "./footer.styled";

const FooterIcons: React.FC = () => {
  return (
    <>
      <Anchor
        href="https://www.facebook.com/groups/ElectricSHE3P/"
        target="_blank"
      >
        <span className="fa-stack fa-lg">
          <i className="fa fa-circle fa-stack-2x" />
          <i className="fa fa-facebook fa-stack-1x fa-inverse reverse" />
        </span>
      </Anchor>
      <Anchor href="https://twitter.com/electricshe3p" target="_blank">
        <span className="fa-stack fa-lg">
          <i className="fa fa-circle fa-stack-2x" />
          <i className="fa fa-twitter fa-stack-1x fa-inverse reverse" />
        </span>
      </Anchor>
      <Anchor
        href="https://github.com/scottdraves/electricsheep"
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
};

export const Footer: React.FC = () => {
  return (
    <StyledFooter id="footer">
      <FooterRow>
        <FooterCol flow="column">
          <div>
            <Anchor>License / Re-use policy</Anchor>
          </div>
          <div>
            <Anchor>Terms of Service</Anchor>
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
