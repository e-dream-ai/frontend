import { Anchor } from "../anchor/anchor";
import { AnchorIcon, Divider, StyledAuthHeader } from "./auth-header.styled";

const AuthAnchor: React.FC<{ text: string; faClass: string }> = ({
  text,
  faClass,
}) => {
  return (
    <Anchor>
      <AnchorIcon className={`${faClass} fa-inverse`} />
      <span>{text}</span>
    </Anchor>
  );
};

export const AuthHeader: React.FC = () => {
  return (
    <StyledAuthHeader>
      <AuthAnchor text="Sign up" faClass="fa fa-pencil" />
      <Divider>/</Divider>
      <AuthAnchor text="Login" faClass="fa fa-lock" />
    </StyledAuthHeader>
  );
};
