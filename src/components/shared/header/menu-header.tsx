import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { HeaderList, HeaderListItem } from "./header.styled";
import { AnchorLink } from "../anchor/anchor";

export const MenuHeader: React.FC<{ onClickMenuItem?: () => void }> = ({
  onClickMenuItem,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<{ name: string; route: string }> = [
    {
      name: t("header.about"),
      route: ROUTES.ABOUT,
    },
    {
      name: t("header.install"),
      route: ROUTES.INSTALL,
    },
    {
      name: t("header.create"),
      route: ROUTES.CREATE,
    },
    { name: t("header.feed"), route: ROUTES.FEED },
    {
      name: t("header.my_dreams"),
      route: ROUTES.MY_DREAMS,
    },
  ];

  const NAV_ROUTES: Array<{ name: string; route: string }> = [
    {
      name: t("header.about"),
      route: ROUTES.ABOUT,
    },
    {
      name: t("header.install"),
      route: ROUTES.INSTALL,
    },
  ];

  return (
    <HeaderList>
      {(user ? USER_NAV_ROUTES : NAV_ROUTES).map((route) => (
        <HeaderListItem key={route.name}>
          <AnchorLink to={route.route} onClick={onClickMenuItem}>
            {route.name}
          </AnchorLink>
        </HeaderListItem>
      ))}
    </HeaderList>
  );
};
