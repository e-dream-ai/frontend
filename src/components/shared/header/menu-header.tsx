import { Anchor } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import useAuth from "hooks/useAuth";
import useModal from "hooks/useModal";
import { useTranslation } from "react-i18next";
import { HeaderList, HeaderListItem } from "./header.styled";

export const MenuHeader: React.FC = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const { t } = useTranslation();

  const USER_NAV_ROUTES: Array<{ name: string; action?: () => void }> = [
    { name: t("header.about") },
    { name: t("header.install") },
    {
      name: t("header.create"),
      action: () => showModal(ModalsKeys.UPLOAD_DREAM_MODAL),
    },
    { name: t("header.feed") },
    { name: t("header.my_dreams") },
    { name: t("header.forum") },
  ];

  const NAV_ROUTES: Array<{ name: string; action?: () => void }> = [
    { name: t("header.about") },
    { name: t("header.install") },
    { name: t("header.forum") },
  ];

  return (
    <HeaderList>
      {(user ? USER_NAV_ROUTES : NAV_ROUTES).map((route) => (
        <HeaderListItem key={route.name}>
          <Anchor onClick={route.action}>{route.name}</Anchor>
        </HeaderListItem>
      ))}
    </HeaderList>
  );
};
