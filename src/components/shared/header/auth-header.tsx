import useLogout from "@/api/auth/useLogout";
import { Anchor, AnchorLink } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import useModal from "@/hooks/useModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-header.styled";
import StyledHeader, {
  HeaderAvatar,
  HeaderAvatarPlaceholder,
  HeaderProfileMenu,
} from "./header.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faLock,
  faPencil,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem } from "@/components/shared/menu/menu";
import { User } from "@/types/auth.types";
import { getUserNameOrEmail } from "@/utils/user.util";

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
                {userWithoutToken?.avatar ? (
                  <HeaderAvatar
                    url={`${userWithoutToken.avatar}?${Date.now()}`}
                  />
                ) : (
                  <HeaderAvatarPlaceholder>
                    <FontAwesomeIcon icon={faUser} />
                  </HeaderAvatarPlaceholder>
                )}
                {getUserNameOrEmail(user)}{" "}
                <FontAwesomeIcon icon={faCaretDown} />
              </HeaderProfileMenu>
            </MenuButton>
          }
          transition
          position="anchor"
          align="end"
          menuClassName="my-menu"
        >
          <AnchorLink type="tertiary" to={ROUTES.MY_PROFILE}>
            <MenuItem onClick={() => ({})}>{t("header.profile")}</MenuItem>
          </AnchorLink>
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
