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
} from "./header.styled";
import { AuthMenu } from "./auth-menu";
import { ROUTES } from "@/constants/routes.constants";
import { Button } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isNavOpen, setNavOpen] = useState<boolean>(false);

  const toggleNav = () => setNavOpen(!isNavOpen);

  return (
    <>
      <HeaderContainer isNavOpen={isNavOpen}>
        <StyledHeader>
          <LogoContainer>
            <LogoAnchor href={ROUTES.ROOT}>
              <LogoIcon
                src="/images/edream-logo-512x512.png"
                alt={t("header.e_dream")}
              />
              <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
            </LogoAnchor>{" "}
            <Button
              transparent
              size="lg"
              before={<FontAwesomeIcon icon={isNavOpen ? faClose : faBars} />}
              onClick={toggleNav}
            />
          </LogoContainer>
          <MenuContainer>
            <Nav isNavOpen={isNavOpen}>
              <NavList onClickMenuItem={toggleNav} />
            </Nav>
            <AuthMenu />
          </MenuContainer>
        </StyledHeader>
      </HeaderContainer>
    </>
  );
};

export default Header;
