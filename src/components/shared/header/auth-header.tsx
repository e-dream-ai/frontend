import useLogout from "@/api/auth/useLogout";
import { Anchor } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useAuth } from "@/hooks/useAuth";
import useModal from "@/hooks/useModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import router from "@/routes/router";
import {
  AnchorIcon,
  Divider,
  HelloMessageHeader,
  StyledAuthHeader,
} from "./auth-header.styled";
import StyledHeader from "./header.styled";

const AuthAnchor: React.FC<{
  text: string;
  faClass: string;
  onClick?: () => void;
}> = ({ text, faClass, onClick }) => {
  return (
    <Anchor onClick={onClick}>
      <AnchorIcon className={`${faClass} fa-inverse`} />
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

  const onNavigateToPlaylists = () => router.navigate(ROUTES.MY_PROFILE);

  if (isLoading) return <StyledHeader />;

  return (
    <StyledAuthHeader>
      {user ? (
        <>
          <HelloMessageHeader>{t("header.hello")} </HelloMessageHeader>
          <Anchor onClick={onNavigateToPlaylists}>{user.email}</Anchor>
        </>
      ) : (
        <AuthAnchor
          text={t("header.signup")}
          faClass="fa fa-pencil"
          onClick={handleShowSignupModal}
        />
      )}
      <Divider>/</Divider>
      {user ? (
        <Anchor onClick={logoutSession}>Logout</Anchor>
      ) : (
        <AuthAnchor
          text={t("header.login")}
          faClass="fa fa-lock"
          onClick={handleShowLoginModal}
        />
      )}
    </StyledAuthHeader>
  );
};
