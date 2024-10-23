import { Anchor, AnchorLink } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-menu.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
  HeaderAvatarPlaceholderDot,
  HeaderAvatarPlaceholderIcon,
  HeaderProfileMenu,
  HeaderUserName,
} from "./header.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faLock,
  faPencil,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem } from "@/components/shared/menu/menu";
import { getUserNameOrEmail } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";
import { useDesktopClientStatus } from "@/hooks/useDesktopClientStatus";

const AuthAnchor: React.FC<{
  text: string;
  icon: React.ReactElement;
  href: string;
}> = ({ text, icon, href }) => {
  return (
    <Anchor type="primary" href={href} style={{ textDecoration: "none" }}>
      <AnchorIcon>{icon}</AnchorIcon>
      <span>{text}</span>
    </Anchor>
  );
};

export const AuthMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();

  const avatarUrl = useImage(user?.avatar, {
    width: 30,
    fit: "cover",
  });

  const { isActive } = useDesktopClientStatus();

  if (isLoading) return <StyledHeader />;

  return (
    <StyledAuthHeader>
      {user ? (
        <Menu
          menuButton={
            <MenuButton>
              <HeaderProfileMenu>
                {user?.avatar ? (
                  <HeaderAvatar url={avatarUrl} connected={isActive} />
                ) : (
                  <HeaderAvatarPlaceholder>
                    <HeaderAvatarPlaceholderIcon>
                      <FontAwesomeIcon icon={faUser} />
                    </HeaderAvatarPlaceholderIcon>
                    <HeaderAvatarPlaceholderDot connected={isActive} />
                  </HeaderAvatarPlaceholder>
                )}
                <HeaderUserName>{getUserNameOrEmail(user)}</HeaderUserName>
                <FontAwesomeIcon icon={faCaretDown} />
              </HeaderProfileMenu>
            </MenuButton>
          }
          transition
          position="anchor"
          align="end"
          menuClassName="my-menu"
        >
          <AnchorLink type="tertiary" to={ROUTES.MY_PROFILE}>
            <MenuItem onClick={() => ({})}>{t("header.profile")}</MenuItem>
          </AnchorLink>
          <AnchorLink type="tertiary" to={ROUTES.MY_DREAMS}>
            <MenuItem onClick={() => ({})}>{t("header.my_dreams")}</MenuItem>
          </AnchorLink>
          <AnchorLink type="tertiary" to={ROUTES.INVITES}>
            <MenuItem onClick={() => ({})}>{t("header.invites")}</MenuItem>
          </AnchorLink>
          <MenuItem onClick={() => logout({ callFetchLogout: true })}>
            {t("header.logout")}
          </MenuItem>
        </Menu>
      ) : (
        <>
          <AuthAnchor
            text={t("header.signup")}
            icon={<FontAwesomeIcon icon={faPencil} />}
            href={ROUTES.SIGNUP}
          />
          <Divider>•</Divider>
          <AuthAnchor
            text={t("header.login")}
            icon={<FontAwesomeIcon icon={faLock} />}
            href="/login"
          />
        </>
      )}
    </StyledAuthHeader>
  );
};
