import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { HeaderList, HeaderListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Text from "../text/text";
import { MouseEventHandler } from "react";

type RouteLink = {
  component: React.ReactNode;
  route: string;
  onlyMobile?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const MenuHeader: React.FC<{ onClickMenuItem?: () => void }> = ({
  onClickMenuItem,
}) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<RouteLink> = [
    {
      component: t("header.profile"),
      route: ROUTES.MY_PROFILE,
      onlyMobile: true,
    },
    {
      component: t("header.about"),
      route: ROUTES.ABOUT,
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
    },
    {
      component: t("header.create"),
      route: ROUTES.CREATE,
    },
    { component: t("header.feed"), route: ROUTES.FEED },
    {
      component: t("header.my_dreams"),
      route: ROUTES.MY_DREAMS,
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
    },
    {
      component: t("header.install"),
      route: ROUTES.INSTALL,
    },
    {
      component: t("header.login"),
      route: ROUTES.LOGIN,
      onlyMobile: true,
    },
    {
      component: t("header.signup"),
      route: ROUTES.SIGNUP,
      onlyMobile: true,
    },
  ];

  console.log({ user, routes: user ? USER_NAV_ROUTES : NAV_ROUTES });

  return (
    <HeaderList>
      {(user ? USER_NAV_ROUTES : NAV_ROUTES).map((route) => {
        const handleOnClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
          onClickMenuItem?.();
          route?.onClick?.(event);
        };

        return (
          <HeaderListItem key={route.route} onlyMobile={route.onlyMobile}>
            <AnchorLink to={route.route} onClick={handleOnClick}>
              {route.component}
            </AnchorLink>
          </HeaderListItem>
        );
      })}
    </HeaderList>
  );
};
