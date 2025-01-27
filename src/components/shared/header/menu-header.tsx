import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { StyledNavList, NavListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";
import { MouseEventHandler } from "react";
import { joinPaths } from "@/utils/router.util";

export type DeviceType = "mobile" | "desktop" | "both";

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
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<RouteLink> = [
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
      component: t("header.my_dreams"),
      route: `/${joinPaths(
        [
          ROUTES.PROFILE,
          user?.uuid ?? "",
          ROUTES.USER_FEED
        ])}`,
      showSlash: true,
      deviceType: "desktop",
    },
    {
      component: t("header.feed"),
      route: ROUTES.FEED,
      showSlash: false,
      deviceType: "desktop",
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      showSlash: true,
      deviceType: "desktop",
    },
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      showSlash: true,
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
            className={route.deviceType}
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
