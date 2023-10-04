import useLogout from "api/auth/useLogout";
import { Anchor } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import { useAuth } from "hooks/useAuth";
import useModal from "hooks/useModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
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
            toast.success("User logged out successfully.");
            logout();
          } else {
            toast.error(`Error logging out user. ${data.message}`);
          }
        },
        onError: () => {
          toast.error("Error logging out user.");
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
          <Anchor>{user.username || user.email}</Anchor>
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
