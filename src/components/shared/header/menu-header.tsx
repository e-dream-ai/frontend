import { FULL_CREATE_ROUTES, ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { StyledNavList, NavListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";
import { MouseEventHandler } from "react";
import { joinPaths } from "@/utils/router.util";
import { DisplayProps } from "styled-system";

export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

type RouteLink = {
  component: React.ReactNode;
  route: string;
  showSlash?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
} & DisplayProps;

export const NavList: React.FC<{ onClickMenuItem?: () => void }> = ({
  onClickMenuItem,
}) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.playlists"),
      route: ROUTES.PLAYLISTS,
      display: "inline-flex"
    },
    {
      component: t("header.remote_control"),
      route: ROUTES.REMOTE_CONTROL,
      display: "inline-flex"
    },
    {
      component: t("header.feed"),
      route: ROUTES.FEED,
      display: ["none", "none", "inline-flex", "inline-flex"]
    },
    {
      component: t("header.create"),
      route: FULL_CREATE_ROUTES.DREAM,
      // using display props from styled-system to setup mobile, tablet, laptop, desktop breakpoints
      display: ["none", "none", "none", "inline-flex"]
    },
    {
      component: t("header.profile"),
      route: ROUTES.MY_PROFILE,
      display: ["none", "none", "none", "inline-flex"]
    },
    {
      component: t("header.my_dreams"),
      route: `/${joinPaths(
        [
          ROUTES.PROFILE,
          user?.uuid ?? "",
          ROUTES.USER_FEED
        ])}`,
      display: "none"
    },
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      display: "none"
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      display: "none"
    },
    {
      component: t("header.help"),
      route: ROUTES.HELP,
      display: "none"
    },
    {
      component: t("header.invites"),
      route: ROUTES.INVITES,
      display: "none"
    },
  ];

  const NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      display: "inline-flex"

    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      display: "inline-flex"
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
            display={route.display}
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
