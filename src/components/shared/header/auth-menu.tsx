import React, { useMemo, useState } from "react";
import { AnchorLink, Text } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-menu.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
  HeaderAvatarPlaceholderDot,
  HeaderAvatarPlaceholderIcon,
  HeaderAvatarPlaceholderX,
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
import { getUserNameOrEmail, isAdmin } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";
import { useDesktopClientStatus } from "@/hooks/useDesktopClientStatus";
import useSocket from "@/hooks/useSocket";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { User } from "@/types/auth.types";

const USER_AUTH_MENU_ROUTES = [
  { route: ROUTES.MY_PROFILE, title: "header.profile" },
  { route: ROUTES.MY_DREAMS, title: "header.my_dreams" },
  // { route: ROUTES.REMOTE_CONTROL, title: "header.remote_control" },
  { route: ROUTES.ABOUT, title: "header.about" },
  // { route: ROUTES.HELP, title: "header.help" },
];

const ADMIN_AUTH_MENU_ROUTES = [
  { route: ROUTES.MY_PROFILE, title: "header.profile" },
  { route: ROUTES.MY_DREAMS, title: "header.my_dreams" },
  // { route: ROUTES.REMOTE_CONTROL, title: "header.remote_control" },
  { route: ROUTES.INVITES, title: "header.invites" },
  { route: ROUTES.ABOUT, title: "header.about" },
  // { route: ROUTES.HELP, title: "header.help" },
];

const AuthAnchor: React.FC<{
  text: string;
  icon: React.ReactElement;
  href: string;
}> = ({ text, icon, href }) => {
  return (
    <AnchorLink type="primary" to={href} style={{ textDecoration: "none" }}>
      <AnchorIcon>{icon}</AnchorIcon>
      <span>{text}</span>
    </AnchorLink>
  );
};

export const AuthMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isLoading, isLoggingOut } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [showConfirmSignoutModal, setShowConfirmSignoutModal] =
    useState<boolean>(false);

  const avatarUrl = useImage(user?.avatar, {
    width: 30,
    fit: "cover",
  });

  const { isActive } = useDesktopClientStatus();
  const { isConnected } = useSocket();

  const onShowConfirmSignoutModal = () => setShowConfirmSignoutModal(true);
  const onHideConfirmSignoutModal = () => setShowConfirmSignoutModal(false);
  const onConfirmSignout = async () => {
    await logout({ callFetchLogout: true });
    onHideConfirmSignoutModal();
  };

  if (isLoading) return <StyledHeader />;

  return (
    <React.Fragment>
      {/**
       * Confirm signout modal
       */}
      <ConfirmModal
        isOpen={showConfirmSignoutModal}
        onCancel={onHideConfirmSignoutModal}
        onConfirm={onConfirmSignout}
        confirmText={t("components.auth_menu.confirm_text")}
        confirmButtonType="danger"
        isConfirming={isLoggingOut}
        title={t("components.auth_menu.confirm_signout_modal_title")}
        text={
          <Text>{t("components.auth_menu.confirm_signout_modal_body")}</Text>
        }
      />

      <StyledAuthHeader>
        {user ? (
          <Menu
            menuButton={
              <MenuButton>
                <HeaderProfileMenu>
                  {user?.avatar ? (
                    <HeaderAvatar
                      url={avatarUrl}
                      desktopClientConnected={isActive}
                      socketConnected={isConnected}
                    />
                  ) : (
                    <HeaderAvatarPlaceholder>
                      <HeaderAvatarPlaceholderIcon>
                        <FontAwesomeIcon icon={faUser} />
                      </HeaderAvatarPlaceholderIcon>
                      <HeaderAvatarPlaceholderDot
                        desktopClientConnected={isActive}
                      />
                      <HeaderAvatarPlaceholderX socketConnected={isConnected}>
                        x
                      </HeaderAvatarPlaceholderX>
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
            {(isUserAdmin ? ADMIN_AUTH_MENU_ROUTES : USER_AUTH_MENU_ROUTES).map(
              (r) => (
                <AnchorLink key={r.route} type="tertiary" to={r.route}>
                  <MenuItem onClick={() => ({})}>{t(r.title)}</MenuItem>
                </AnchorLink>
              ),
            )}

            <MenuItem key="logout" onClick={onShowConfirmSignoutModal}>
              {t("header.logout")}
            </MenuItem>
          </Menu>
        ) : (
          <>
            <AuthAnchor
              key="signup"
              text={t("header.signup")}
              icon={<FontAwesomeIcon icon={faPencil} />}
              href={ROUTES.SIGNUP}
            />
            <Divider>•</Divider>
            <AuthAnchor
              key="signin"
              text={t("header.login")}
              icon={<FontAwesomeIcon icon={faLock} />}
              href={ROUTES.SIGNIN}
            />
          </>
        )}
      </StyledAuthHeader>
    </React.Fragment>
  );
};
