import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { StyledNavList, NavListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Text from "../text/text";
import { MouseEventHandler } from "react";

type RouteLink = {
  component: React.ReactNode;
  route: string;
  onlyMobile?: boolean;
  showSlash?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const NavList: React.FC<{ onClickMenuItem?: () => void }> = ({
  onClickMenuItem,
}) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.profile"),
      route: ROUTES.MY_PROFILE,
      onlyMobile: true,
      showSlash: true,
    },
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      showSlash: true,
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      showSlash: true,
    },
    {
      component: t("header.create"),
      route: ROUTES.CREATE,
      showSlash: true,
    },
    { component: t("header.ranked"), route: ROUTES.RANKED, showSlash: true },
    { component: t("header.feed"), route: ROUTES.FEED, showSlash: true },
    {
      component: t("header.my_dreams"),
      route: ROUTES.MY_DREAMS,
      showSlash: false,
    },
    {
      component: (
        <>
          {t("header.logout")}
          <Text mr="1rem" />
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </>
      ),
      route: ROUTES.ROOT,
      onlyMobile: true,
      showSlash: false,
      onClick: (event) => {
        event.stopPropagation();
        logout();
      },
    },
  ];

  const NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
      showSlash: true,
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
      showSlash: false,
    },
    {
      component: t("header.login"),
      route: ROUTES.LOGIN,
      onlyMobile: true,
      showSlash: false,
    },
    {
      component: t("header.signup"),
      route: ROUTES.SIGNUP,
      onlyMobile: true,
      showSlash: false,
    },
  ];

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
            onlyMobile={route.onlyMobile}
            showSlash={route.showSlash}
          >
            <AnchorLink to={route.route} onClick={handleOnClick}>
              {route.component}
            </AnchorLink>
          </NavListItem>
        );
      })}
    </StyledNavList>
  );
};
