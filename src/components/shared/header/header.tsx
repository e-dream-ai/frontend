import { ForgotPasswordModal } from "components/modals";
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

  return (
    <>
      <ForgotPasswordModal isOpen={false} />
      <StyledHeader>
        <HeaderLogo>
          <HeaderImage
            onClick={navigateHome}
            src="/images/edream-logo-512x512.png"
            className="img-responsive"
            alt="Electric Sheep"
          />
          <HeaderTitle>e-dream.ai</HeaderTitle>
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
