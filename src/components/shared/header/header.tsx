import { useTranslation } from "react-i18next";
import { NavList } from "./menu-header";
import StyledHeader, {
  NavContainer,
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
import Row from "../row/row";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <HeaderContainer>
        <StyledHeader flexDirection="row" flexWrap={["wrap", "wrap", "nowrap", "nowrap"]} justifyContent="space-between">
          <LogoContainer order={1}>
            <LogoAnchor to={user ? ROUTES.REMOTE_CONTROL : ROUTES.ROOT}>
              <LogoIcon
                src="/images/edream-logo-512x512.png"
                alt={t("header.e_dream")}
              />
              <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
            </LogoAnchor>
          </LogoContainer>

          <NavContainer
            order={[3, 2, 2, 2]}
            justifyContent="space-between"
            display={user ? "flex" : ["none", "flex", "flex", "flex"]}
          >
            <Nav>
              <NavList />
            </Nav>
          </NavContainer>

          <ProfileContainer
            order={[2, 3, 3, 3]}
            ml={user ? ["15vw", "0rem", "1rem", "1rem"] : "1rem"}
          >
            <HeaderProfile />
            <Row
              m={0}
              display={user ? "flex" : ["flex", "none", "none", "none"]}
            >
              <KebabMenu />
            </Row>
          </ProfileContainer>
        </StyledHeader>
      </HeaderContainer>
    </>
  );
};

export default Header;
