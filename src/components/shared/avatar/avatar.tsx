import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Sizes } from "@/types/sizes.types";
import { AvatarPlaceholder, StyledAvatar } from "./avatar.styled";

export const Avatar: React.FC<{
  children?: React.ReactNode;
  url?: string;
  size: Sizes;
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
