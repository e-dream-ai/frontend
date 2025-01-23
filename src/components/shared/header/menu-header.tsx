import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { StyledNavList, NavListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
// import Text from "../text/text";
import { MouseEventHandler } from "react";

export type DeviceType = "desktop" | "both";

type RouteLink = {
  component: React.ReactNode;
  route: string;
  deviceType?: DeviceType;
  showSlash?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const NavList: React.FC<{ onClickMenuItem?: () => void }> = ({
  onClickMenuItem,
}) => {
  const { user, isLoading /* ,logout */ } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      showSlash: true,
      deviceType: "desktop",
    },
    {
      component: t("header.create"),
      route: FULL_CREATE_ROUTES.DREAM,
      showSlash: true,
      deviceType: "desktop",
    },
    {
      component: t("header.playlists"),
      route: ROUTES.PLAYLISTS,
      showSlash: true,
      deviceType: "both",
    },
    {
      component: t("header.remote_control"),
      route: ROUTES.REMOTE_CONTROL,
      showSlash: true,
      deviceType: "both",
    },
    {
      component: t("header.feed"),
      route: ROUTES.FEED,
      showSlash: false,
      deviceType: "desktop",
    },
  ];

  const NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      showSlash: true,
      deviceType: "desktop",
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      showSlash: false,
      deviceType: "desktop",
    },
  ];

  if (isLoading) return <></>;

  return (
    <StyledNavList>
      {(user ? USER_NAV_ROUTES : NAV_ROUTES).map((route) => {
        const handleOnClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
          onClickMenuItem?.();
          route?.onClick?.(event);
        };

        return (
          <NavListItem
            key={route.route}
            deviceType={route.deviceType}
            showSlash={route.showSlash}
            className={route.deviceType === "both" ? "both" : "desktop"}
          >
            <AnchorLink to={route.route} onClick={handleOnClick} style={{ textDecoration: "none" }}>
              {route.component}
            </AnchorLink>
          </NavListItem>
        );
      })}
    </StyledNavList>
  );
};
