import { ForgotPasswordModal } from "@/components/modals";
import { useTranslation } from "react-i18next";
import { AuthHeader } from "./auth-header";
import StyledHeader, {
  HeaderImage,
  HeaderLogo,
  HeaderTitle,
  NavHeader,
} from "./header.styled";
import { MenuHeader } from "./menu-header";
import { ROUTES } from "@/constants/routes.constants";

export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <ForgotPasswordModal isOpen={false} />
      <StyledHeader>
        <HeaderLogo href={ROUTES.ROOT}>
          <HeaderImage
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
