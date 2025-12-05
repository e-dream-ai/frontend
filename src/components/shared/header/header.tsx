import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  HeaderContainer,
  LogoAnchor,
  LogoContainer,
  NavContainer,
  Nav,
  ProfileContainer,
} from "./header.styled";
import { HeaderProfile } from "./header-profile";
import { KebabMenu } from "./kebab-menu";
import { ROUTES } from "@/constants/routes.constants";
import { NavList } from "./menu-header";
import useAuth from "@/hooks/useAuth";
import Row from "../row/row";
import StyledHeaderBase, {
  LogoIcon as LogoIconBase,
  HeaderTitle as HeaderTitleBase,
} from "./header.styled";

const MotionStyledHeader = motion(StyledHeaderBase);
const MotionLogoIcon = motion(LogoIconBase);
const MotionHeaderTitle = motion(HeaderTitleBase);

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  const logoHeight = useTransform(scrollY, [0, 150], ["6rem", "3rem"]);
  const titleFontSize = useTransform(scrollY, [0, 150], ["2.2rem", "1.6rem"]);
  const headerPadding = useTransform(scrollY, [0, 150], ["1rem 0", "0.5rem 0"]);

  return (
    <HeaderContainer>
      <MotionStyledHeader
        flexDirection="row"
        flexWrap={["wrap", "wrap", "nowrap", "nowrap"]}
        justifyContent="space-between"
        style={{
          padding: headerPadding as unknown as string,
          transition: "padding 0.2s ease",
        }}
      >
        <LogoContainer order={1}>
          <LogoAnchor to={user ? ROUTES.REMOTE_CONTROL : ROUTES.ROOT}>
            <MotionLogoIcon
              src="/images/edream-logo-512x512.png"
              alt={t("header.e_dream")}
              style={{ height: logoHeight }}
            />
            <MotionHeaderTitle
              style={{
                fontSize: titleFontSize,
              }}
            >
              {t("header.e_dream")}
            </MotionHeaderTitle>
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
          <Row m={0} display={user ? "flex" : ["flex", "none", "none", "none"]}>
            <KebabMenu />
          </Row>
        </ProfileContainer>
      </MotionStyledHeader>
    </HeaderContainer>
  );
};

export default Header;
