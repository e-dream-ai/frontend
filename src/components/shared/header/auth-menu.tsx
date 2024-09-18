import { Anchor, AnchorLink } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-menu.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
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
import { User } from "@/types/auth.types";
import { getUserNameOrEmail } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";
import { useDesktopClientStatus } from "@/hooks/useDesktopClientStatus";

const AuthAnchor: React.FC<{
  text: string;
  icon: React.ReactElement;
  href: string;
}> = ({ text, icon, href }) => {
  return (
    <Anchor href={href}>
      <AnchorIcon>{icon}</AnchorIcon>
      <span>{text}</span>
    </Anchor>
  );
};

export const AuthMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const userWithoutToken = user as Omit<User, "token">;

  const avatarUrl = useImage(userWithoutToken?.avatar, {
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
                {userWithoutToken?.avatar ? (
                  <HeaderAvatar url={avatarUrl} connected={isActive} />
                ) : (
                  <HeaderAvatarPlaceholder connected={isActive}>
                    <FontAwesomeIcon icon={faUser} />
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
          <MenuItem onClick={() => logout()}>{t("header.logout")}</MenuItem>
        </Menu>
      ) : (
        <>
          <AuthAnchor
            text={t("header.signup")}
            icon={<FontAwesomeIcon icon={faPencil} />}
            href={ROUTES.SIGNUP}
          />
          <Divider>/</Divider>
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
