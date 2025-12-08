import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  HeaderContainer,
  LogoAnchor,
  LogoContainer,
  LogoProfileWrapper,
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

  const logoHeight = useTransform(scrollY, [0, 150], ["4rem", "2.5rem"]);
  const titleFontSize = useTransform(scrollY, [0, 150], ["2.2rem", "1.6rem"]);
  const headerPaddingTop = useTransform(scrollY, [0, 150], ["1rem", "0.5rem"]);
  const headerPaddingBottom = useTransform(
    scrollY,
    [0, 150],
    ["1rem", "0.5rem"],
  );

  return (
    <HeaderContainer>
      <MotionStyledHeader
        flexDirection="row"
        flexWrap={["wrap", "wrap", "nowrap", "nowrap"]}
        justifyContent="space-between"
        style={{
          paddingTop: headerPaddingTop as unknown as string,
          paddingBottom: headerPaddingBottom as unknown as string,
          transition: "padding 0.2s ease",
        }}
      >
        <LogoProfileWrapper
          order={[1, 1, 1, 1]}
          flexDirection="row"
          alignItems="center"
          display={["flex", "flex", "none", "none"]}
        >
          <LogoContainer>
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

          <ProfileContainer ml="0rem">
            <HeaderProfile />
            <Row
              m={0}
              display={user ? "flex" : ["flex", "none", "none", "none"]}
            >
              <KebabMenu />
            </Row>
          </ProfileContainer>
        </LogoProfileWrapper>

        <LogoContainer order={1} display={["none", "none", "flex", "flex"]}>
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
          order={[3, 3, 2, 2]}
          justifyContent="space-between"
          display={user ? "flex" : ["none", "flex", "flex", "flex"]}
        >
          <Nav>
            <NavList />
          </Nav>
        </NavContainer>

        <ProfileContainer
          order={[4, 4, 3, 3]}
          ml={user ? "0rem" : "1rem"}
          display={["none", "none", "flex", "flex"]}
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
