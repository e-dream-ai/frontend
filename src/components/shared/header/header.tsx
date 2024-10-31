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
  AuthMenuContainer,
  BarsButtonContainer,
} from "./header.styled";
import { AuthMenu } from "./auth-menu";
import { ROUTES } from "@/constants/routes.constants";
import { Button } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import useOutsideClick from "@/hooks/useOutsideClick";
import useAuth from "@/hooks/useAuth";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isNavOpen, setNavOpen] = useState<boolean>(false);
  const menuContainerRef = useRef(null);
  const barsButtonRef = useRef(null);

  const toggleNav = () => setNavOpen(!isNavOpen);

  useOutsideClick(menuContainerRef, () => setNavOpen(false), [barsButtonRef]);

  return (
    <>
      <HeaderContainer isNavOpen={isNavOpen}>
        <StyledHeader>
          <LogoContainer>
            <LogoAnchor href={user ? ROUTES.REMOTE_CONTROL : ROUTES.ROOT}>
              <LogoIcon
                src="/images/edream-logo-512x512.png"
                alt={t("header.e_dream")}
              />
              <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
            </LogoAnchor>
          </LogoContainer>

          <AuthMenuContainer>
            <AuthMenu />
          </AuthMenuContainer>

          <BarsButtonContainer>
            <Button
              ref={barsButtonRef}
              transparent
              size="lg"
              before={<FontAwesomeIcon icon={isNavOpen ? faClose : faBars} />}
              onClick={toggleNav}
            />
          </BarsButtonContainer>

          <MenuContainer ref={menuContainerRef} isNavOpen={isNavOpen}>
            <Nav isNavOpen={isNavOpen}>
              <NavList onClickMenuItem={toggleNav} />
            </Nav>
          </MenuContainer>
        </StyledHeader>
      </HeaderContainer>
    </>
  );
};

export default Header;
