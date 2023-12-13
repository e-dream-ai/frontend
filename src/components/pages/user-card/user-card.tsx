import { Avatar } from "components/shared/profile-card/profile-card.styled";
import Text from "components/shared/text/text";
import { User } from "types/auth.types";
import { StyledUserCard } from "./user-card.styled";

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <StyledUserCard>
      <Avatar url={user.avatar ? `${user.avatar}?${Date.now()}` : undefined} />
      <Text mt="1rem" mb="0.5rem" fontSize="1rem" fontWeight={600}>
        {user?.email}
      </Text>
    </StyledUserCard>
  );
};

export default UserCard;
