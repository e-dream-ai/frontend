import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { AvatarPlaceholder, AvatarSize, StyledAvatar } from "./avatar.styled";

export const Avatar: React.FC<{
  children?: React.ReactNode;
  url?: string;
  size: AvatarSize;
}> = ({ children, url, size }) =>
  url ? (
    <StyledAvatar size={size} url={url}>
      {children}
    </StyledAvatar>
  ) : (
    <AvatarPlaceholder size={size}>
      <FontAwesomeIcon icon={faUser} />
    </AvatarPlaceholder>
  );
