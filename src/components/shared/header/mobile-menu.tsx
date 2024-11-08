import { AnchorLink, Button } from "@/components/shared";
import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@/components/shared/menu/menu";
import { useTranslation } from "react-i18next";

export const MobileMenu: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES = [
    {
      title: t("header.about"),
      route: ROUTES.ABOUT,
    },
    {
      title: t("header.install"),
      route: ROUTES.INSTALL,
    },
    {
      title: t("header.create"),
      route: FULL_CREATE_ROUTES.DREAM,
    },
    {
      title: t("header.playlists"),
      route: ROUTES.PLAYLISTS,
    },
    { title: t("header.feed"), route: ROUTES.FEED, showSlash: false },
  ];

  const NAV_ROUTES = [
    {
      title: t("header.about"),
      route: ROUTES.ABOUT,
    },
    {
      title: t("header.install"),
      route: ROUTES.INSTALL,
    },
  ];

  return (
    <Menu
      menuButton={
        <Button transparent size="lg">
          <FontAwesomeIcon icon={faEllipsisV} />
        </Button>
      }
      transition
      position="anchor"
      align="end"
      menuClassName="my-menu"
    >
      {(user ? USER_NAV_ROUTES : NAV_ROUTES).map((route) => (
        <AnchorLink key={route.route} type="tertiary" to={route.route}>
          <MenuItem onClick={() => ({})}>{route.title}</MenuItem>
        </AnchorLink>
      ))}
    </Menu>
  );
};
