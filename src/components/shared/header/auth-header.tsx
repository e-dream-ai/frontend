import useLogout from "@/api/auth/useLogout";
import { Anchor, AnchorLink } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import useModal from "@/hooks/useModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  AnchorIcon,
  Divider,
  HelloMessageHeader,
  StyledAuthHeader,
} from "./auth-header.styled";
import StyledHeader from "./header.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPencil } from "@fortawesome/free-solid-svg-icons";

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
        <>
          <HelloMessageHeader>{t("header.hello")} </HelloMessageHeader>
          <AnchorLink to={ROUTES.MY_PROFILE}>{user.email}</AnchorLink>
        </>
      ) : (
        <AuthAnchor
          text={t("header.signup")}
          icon={<FontAwesomeIcon icon={faPencil} />}
          onClick={handleShowSignupModal}
        />
      )}
      <Divider>/</Divider>
      {user ? (
        <Anchor onClick={logoutSession}>Logout</Anchor>
      ) : (
        <AuthAnchor
          text={t("header.login")}
          icon={<FontAwesomeIcon icon={faLock} />}
          onClick={handleShowLoginModal}
        />
      )}
    </StyledAuthHeader>
  );
};
