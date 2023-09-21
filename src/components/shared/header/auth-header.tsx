import { Anchor } from "../anchor/anchor";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-header.styled";

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
  return (
    <StyledAuthHeader>
      <AuthAnchor
        text="Sign up"
        faClass="fa fa-pencil"
        onClick={showSignupModal}
      />
      <Divider>/</Divider>
      <AuthAnchor text="Login" faClass="fa fa-lock" onClick={showLoginModal} />
    </StyledAuthHeader>
  );
};
