import { useTranslation } from "react-i18next";
import { AuthHeader } from "./auth-header";
import StyledHeader, {
  BottomHeader,
  HeaderContainer,
  HeaderTitle,
  LogoAnchor,
  LogoContainer,
  LogoIcon,
  NavHeader,
  TopHeader,
} from "./header.styled";
import { MenuHeader } from "./menu-header";
import { ROUTES } from "@/constants/routes.constants";
import { Button } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isNavOpen, setNavOpen] = useState<boolean>(false);

  const handleOpenNav = () => setNavOpen(true);
  const handleCloseNav = () => setNavOpen(false);

  return (
    <>
      <HeaderContainer>
        <StyledHeader>
          <TopHeader>
            <AuthHeader />
          </TopHeader>
          <BottomHeader>
            <LogoContainer>
              <p></p>
              <LogoAnchor href={ROUTES.ROOT}>
                <LogoIcon
                  src="/images/edream-logo-512x512.png"
                  alt={t("header.e_dream")}
                />
                <HeaderTitle>{t("header.e_dream")}</HeaderTitle>
              </LogoAnchor>{" "}
              {isNavOpen ? (
                <Button
                  transparent
                  size="lg"
                  before={<FontAwesomeIcon icon={faClose} />}
                  onClick={handleCloseNav}
                />
              ) : (
                <Button
                  transparent
                  size="lg"
                  before={<FontAwesomeIcon icon={faBars} />}
                  onClick={handleOpenNav}
                />
              )}
            </LogoContainer>
            <NavHeader isOpen={isNavOpen}>
              <MenuHeader onClickMenuItem={handleCloseNav} />
            </NavHeader>
          </BottomHeader>
        </StyledHeader>
      </HeaderContainer>
    </>
  );
};

export default Header;
