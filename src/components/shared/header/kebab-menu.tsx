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
import { VoidFunction } from "@/utils/function.util";

const createMenuRoutes = (user?: User | null) => {

  const USER_ROUTES = [
    {
      title: "header.playlists",
      route: ROUTES.PLAYLISTS,
      display: "none"
    },
    {
      title: "header.remote_control",
      route: ROUTES.REMOTE_CONTROL,
      display: "none"
    },
    {
      title: "header.feed",
      route: ROUTES.FEED,
      display: ["block", "block", "none", "none"]
    },
    {
      title: "header.create",
      route: FULL_CREATE_ROUTES.DREAM,
      // using display props from styled-system to setup mobile, tablet, laptop, desktop breakpoints
      display: ["block", "block", "block", "none"]
    },
    {
      title: "header.profile",
      route: ROUTES.MY_PROFILE,
      display: ["block", "block", "block", "none"]
    },
    {
      title: "header.my_dreams",
      route: `/${joinPaths(
        [
          ROUTES.PROFILE,
          user?.uuid ?? "",
          ROUTES.USER_FEED
        ])}`,
      display: "block"
    },
    {
      title: "header.about",
      route: ROUTES.ABOUT,
      display: "block"
    },
    {
      title: "header.install",
      route: ROUTES.INSTALL,
      display: "block"
    },
    {
      title: "header.help",
      route: ROUTES.HELP,
      display: "block"
    },
    {
      title: "header.invites",
      route: ROUTES.INVITES,
      display: "block"
    },
  ];

  // items to show to guests
  const GUEST_ROUTES = [
    {
      title: "header.about",
      route: ROUTES.ABOUT,
      display: "block"
    },
    {
      title: "header.install",
      route: ROUTES.INSTALL,
      display: "block"
    },
  ]

  if (!user) {
    return {
      user: GUEST_ROUTES,
      admin: GUEST_ROUTES
    }
  }

  return {
    // remove invites from routes for normal users
    user: USER_ROUTES.filter(r => r.title !== "header.invites"),
    admin: USER_ROUTES
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
              display={r.display}
              style={{ textDecoration: "none", textTransform: "lowercase" }}
            >
              <MenuItem onClick={VoidFunction}>{t(r.title)}</MenuItem>
            </AnchorLink>
          ),
        )}

        {
          user ?
            <MenuItem
              key="logout"
              onClick={onShowConfirmSignoutModal}
              style={{ textDecoration: "none", textTransform: "lowercase" }}
            >
              {t("header.logout")}
            </MenuItem>
            : <></>
        }
      </Menu>
    </Fragment>
  );
};
