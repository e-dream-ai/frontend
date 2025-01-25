import { useTranslation } from "react-i18next";
import { NavList } from "./menu-header";
import StyledHeader, {
  MenuContainer,
  HeaderContainer,
  HeaderTitle,
  LogoAnchor,
  LogoContainer,
  LogoIcon,
  Nav,
  ProfileContainer,
} from "./header.styled";
import { HeaderProfile } from "./header-profile";
import { ROUTES } from "@/constants/routes.constants";
import { KebabMenu } from "./kebab-menu";
import useAuth from "@/hooks/useAuth";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <HeaderContainer>
        <StyledHeader>
          <LogoContainer>
            <LogoAnchor to={user ? ROUTES.REMOTE_CONTROL : ROUTES.ROOT}>
              <LogoIcon
                src="/images/edream-logo-512x512.png"
                alt={t("header.e_dream")}
              />
              <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
            </LogoAnchor>
          </LogoContainer>

          <ProfileContainer>
            <HeaderProfile />
            <KebabMenu />
          </ProfileContainer>

          <MenuContainer>
            <Nav>
              <NavList />
            </Nav>
          </MenuContainer>
        </StyledHeader>
      </HeaderContainer>
    </>
  );
};

export default Header;
