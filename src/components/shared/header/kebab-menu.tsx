import { Fragment, useMemo, useState } from "react";
import { AnchorLink, Button, Text } from "@/components/shared";
import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@/components/shared/menu/menu";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";
import { joinPaths } from "@/utils/router.util";

const createMenuRoutes = (user?: User | null) => {
  const USER_AUTH_MENU_ROUTES = [
    {
      title: "header.my_dreams",
      route: `/${joinPaths(
        [
          ROUTES.PROFILE,
          user?.uuid ?? "",
          ROUTES.USER_FEED
        ])}`,
      deviceType: "mobile",
    },
    {
      title: "header.feed",
      route: ROUTES.FEED,
      deviceType: "mobile",
    },
    {
      title: "header.install",
      route: ROUTES.INSTALL,
      deviceType: "mobile",
    },
    {
      title: "header.about",
      route: ROUTES.ABOUT,
      deviceType: "mobile",
    },
    {
      route: FULL_CREATE_ROUTES.DREAM,
      title: "header.create"
    },
    {
      route: ROUTES.HELP,
      title: "header.help"
    },
  ];

  const ADMIN_AUTH_MENU_ROUTES = [
    {
      title: "header.my_dreams",
      route: `/${joinPaths(
        [
          ROUTES.PROFILE,
          user?.uuid ?? "",
          ROUTES.USER_FEED
        ])}`,
      deviceType: "mobile",
    },
    {
      title: "header.feed",
      route: ROUTES.FEED,
      deviceType: "mobile",
    },
    {
      title: "header.install",
      route: ROUTES.INSTALL,
      deviceType: "mobile",
    },
    {
      title: "header.about",
      route: ROUTES.ABOUT,
      deviceType: "mobile",
    },
    {
      route: FULL_CREATE_ROUTES.DREAM,
      title: "header.create"
    },
    {
      route: ROUTES.HELP,
      title: "header.help"
    },
    {
      route: ROUTES.INVITES,
      title: "header.invites"
    },
  ];

  return {
    user: USER_AUTH_MENU_ROUTES,
    admin: ADMIN_AUTH_MENU_ROUTES
  };
};

export const KebabMenu: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useTranslation();

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [showConfirmSignoutModal, setShowConfirmSignoutModal] =
    useState<boolean>(false);

  const onShowConfirmSignoutModal = () => setShowConfirmSignoutModal(true);
  const onHideConfirmSignoutModal = () => setShowConfirmSignoutModal(false);
  const onConfirmSignout = async () => {
    await logout({ callFetchLogout: true });
    onHideConfirmSignoutModal();
  };

  const routes = useMemo(() => createMenuRoutes(user)[isUserAdmin ? "admin" : "user"], [user, isUserAdmin]);

  return (
    <Fragment>

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
      <Menu
        menuButton={
          <Button transparent size="lg">
            <FontAwesomeIcon icon={faEllipsisV} />
          </Button>
        }
        transition
        position="anchor"
        align="end"
        menuClassName="my-kebab-menu"
      >
        {(routes).map(
          (r) => (
            <AnchorLink
              key={r.route}
              type="tertiary"
              to={r.route}
              className={r.deviceType}
              style={{ textDecoration: "none" }}
            >
              <MenuItem onClick={() => ({})}>{t(r.title)}</MenuItem>
            </AnchorLink>
          ),
        )}

        <MenuItem key="logout" onClick={onShowConfirmSignoutModal}>
          {t("header.logout")}
        </MenuItem>
      </Menu>
    </Fragment>
  );
};
