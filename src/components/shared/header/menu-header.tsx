import { Anchor } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import useAuth from "hooks/useAuth";
import useModal from "hooks/useModal";
import { HeaderList, HeaderListItem } from "./header.styled";

export const MenuHeader: React.FC = () => {
  const { user } = useAuth();
  const { showModal } = useModal();

  const USER_NAV_ROUTES: Array<{ name: string; action?: () => void }> = [
    { name: "About" },
    { name: "Install" },
    { name: "Create", action: () => showModal(ModalsKeys.UPLOAD_DREAM_MODAL) },
    { name: "Feed" },
    { name: "My Dreams" },
    { name: "Forum" },
  ];

  const NAV_ROUTES: Array<{ name: string; action?: () => void }> = [
    { name: "About" },
    { name: "Install" },
    { name: "Forum" },
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
