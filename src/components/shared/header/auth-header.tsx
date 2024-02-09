import useLogout from "@/api/auth/useLogout";
import { Anchor, AnchorLink } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import useModal from "@/hooks/useModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-header.styled";
import StyledHeader, { HeaderAvatar, HeaderProfileMenu } from "./header.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faLock,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem } from "@/components/shared/menu/menu";
import { getUserName } from "@/utils/user.util";
import { User } from "@/types/auth.types";

const AuthAnchor: React.FC<{
  text: string;
  icon: React.ReactElement;
  onClick?: () => void;
}> = ({ text, icon, onClick }) => {
  return (
    <Anchor onClick={onClick}>
      <AnchorIcon>{icon}</AnchorIcon>
      <span>{text}</span>
    </Anchor>
  );
};

export const AuthHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const userWithoutToken = user as Omit<User, "token">;
  const { mutate } = useLogout();
  const { showModal } = useModal();
  const handleShowLoginModal = () => showModal(ModalsKeys.LOGIN_MODAL);
  const handleShowSignupModal = () => showModal(ModalsKeys.SIGNUP_MODAL);

  const logoutSession = () => {
    mutate(
      { refreshToken: user?.token?.RefreshToken ?? "" },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(t("modal.logout.user_logged_out_successfully"));
            logout();
          } else {
            toast.error(
              `${t("modal.logout.error_signingout_user")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.logout.error_signingout_user"));
        },
      },
    );
  };

  if (isLoading) return <StyledHeader />;

  return (
    <StyledAuthHeader>
      {user ? (
        <Menu
          menuButton={
            <MenuButton>
              <HeaderProfileMenu>
                <HeaderAvatar url={userWithoutToken?.avatar} />
                {getUserName(userWithoutToken)}{" "}
                <FontAwesomeIcon icon={faCaretDown} />
              </HeaderProfileMenu>
            </MenuButton>
          }
          transition
          position="anchor"
          align="end"
          menuClassName="my-menu"
        >
          <MenuItem onClick={() => ({})}>
            <AnchorLink type="tertiary" to={ROUTES.MY_PROFILE}>
              {t("header.profile")}
            </AnchorLink>
          </MenuItem>
          <MenuItem onClick={logoutSession}>{t("header.logout")}</MenuItem>
        </Menu>
      ) : (
        <>
          <AuthAnchor
            text={t("header.signup")}
            icon={<FontAwesomeIcon icon={faPencil} />}
            onClick={handleShowSignupModal}
          />
          <Divider>/</Divider>
          <AuthAnchor
            text={t("header.login")}
            icon={<FontAwesomeIcon icon={faLock} />}
            onClick={handleShowLoginModal}
          />
        </>
      )}
    </StyledAuthHeader>
  );
};
