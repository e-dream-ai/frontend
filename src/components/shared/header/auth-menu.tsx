import React, { useMemo, useState } from "react";
import { AnchorLink, Text } from "@/components/shared";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-menu.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
  HeaderAvatarPlaceholderIcon,
  HeaderAvatarWrapper,
  HeaderProfileMenu,
  HeaderUserName,
  StyledSocketStatus,
  StyledStatusDot,
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
import { joinPaths } from "@/utils/router.util";
import { useImage } from "@/hooks/useImage";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import useSocket from "@/hooks/useSocket";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { User } from "@/types/auth.types";

const createMenuRoutes = (userUUID?: string) => {
  const USER_AUTH_MENU_ROUTES = [
    { route: ROUTES.MY_PROFILE, title: "header.profile" },
    { route: `/${joinPaths([ROUTES.PROFILE, userUUID ?? "", ROUTES.USER_FEED])}`, title: "header.my_dreams" },
    { route: ROUTES.ABOUT, title: "header.about" },
  ];

  const ADMIN_AUTH_MENU_ROUTES = [
    { route: ROUTES.MY_PROFILE, title: "header.profile" },
    { route: `/${joinPaths([ROUTES.PROFILE, userUUID ?? "", ROUTES.USER_FEED])}`, title: "header.my_dreams" },
    { route: ROUTES.INVITES, title: "header.invites" },
    { route: ROUTES.ABOUT, title: "header.about" },
  ];

  return {
    user: USER_AUTH_MENU_ROUTES,
    admin: ADMIN_AUTH_MENU_ROUTES
  };
};

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

  const { isActive } = useDesktopClient();
  const { isConnected } = useSocket();

  const avatarUrl = useImage(user?.avatar, {
    width: 30,
    fit: "cover",
  });

  const routes = useMemo(() => createMenuRoutes(user?.uuid)[isUserAdmin ? "admin" : "user"], [isUserAdmin, user])

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
                  <HeaderAvatarWrapper>
                    <StatusDot
                      socketConnected={isConnected}
                      desktopClientConnected={isActive}
                    />
                    {user?.avatar ? (
                      <HeaderAvatar
                        url={avatarUrl}
                      />
                    ) : (
                      <HeaderAvatarPlaceholder>
                        <HeaderAvatarPlaceholderIcon>
                          <FontAwesomeIcon icon={faUser} />
                        </HeaderAvatarPlaceholderIcon>
                      </HeaderAvatarPlaceholder>
                    )}
                  </HeaderAvatarWrapper>
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
            {(routes).map(
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

export const StatusDot: React.FC<{
  socketConnected: boolean;
  desktopClientConnected: boolean;
}> = ({ socketConnected, desktopClientConnected }) => {
  return (
    <StyledStatusDot desktopClientConnected={desktopClientConnected}>
      <StyledSocketStatus socketConnected={socketConnected}>x</StyledSocketStatus>
    </StyledStatusDot>
  );
}