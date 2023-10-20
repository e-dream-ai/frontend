import { ForgotPasswordModal } from "components/modals";
import { useTranslation } from "react-i18next";
import { router } from "routes/router";
import { AuthHeader } from "./auth-header";
import StyledHeader, {
  HeaderImage,
  HeaderLogo,
  HeaderTitle,
  NavHeader,
} from "./header.styled";
import { MenuHeader } from "./menu-header";

export const Header: React.FC = () => {
  const navigateHome = () => router.navigate("/#");
  const { t } = useTranslation();

  return (
    <>
      <ForgotPasswordModal isOpen={false} />
      <StyledHeader>
        <HeaderLogo>
          <HeaderImage
            onClick={navigateHome}
            src="/images/edream-logo-512x512.png"
            alt={t("header.e_dream")}
          />
          <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
        </HeaderLogo>
        <NavHeader>
          <AuthHeader />
          <MenuHeader />
        </NavHeader>
      </StyledHeader>
    </>
  );
};

export default Header;
