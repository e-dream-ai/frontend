import useLogout from "api/auth/useLogout";
import { Anchor } from "components/shared";
import { useAuth } from "hooks/useAuth";
import { toast } from "react-toastify";
import {
  AnchorIcon,
  Divider,
  HelloMessageHeader,
  StyledAuthHeader,
} from "./auth-header.styled";
import StyledHeader from "./header.styled";

type AuthHeaderProps = {
  showLoginModal?: () => void;
  showSignupModal?: () => void;
};

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

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  showLoginModal,
  showSignupModal,
}) => {
  const { user, logout, isLoading } = useAuth();
  const { mutate } = useLogout();

  const logoutSession = () => {
    mutate(
      { refreshToken: user?.token?.RefreshToken ?? "" },
      {
        onSuccess: () => {
          toast.success("User logged out successfully.");
          logout();
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
          <HelloMessageHeader>Hello </HelloMessageHeader>
          <Anchor>{user.username || user.email}</Anchor>
        </>
      ) : (
        <AuthAnchor
          text="Sign up"
          faClass="fa fa-pencil"
          onClick={showSignupModal}
        />
      )}
      <Divider>/</Divider>
      {user ? (
        <Anchor onClick={logoutSession}>Logout</Anchor>
      ) : (
        <AuthAnchor
          text="Login"
          faClass="fa fa-lock"
          onClick={showLoginModal}
        />
      )}
    </StyledAuthHeader>
  );
};
