import {
  Avatar,
  AvatarPlaceholder,
} from "components/shared/profile-card/profile-card.styled";
import Text from "components/shared/text/text";
import { User } from "types/auth.types";
import { StyledUserCard, StyledUserCardList } from "./user-card.styled";
import { Sizes } from "types/sizes.types";
import { Column, Row } from "components/shared";
import { useNavigate } from "react-router-dom";

const UserCard: React.FC<{ user: User; size: Sizes }> = ({ user, size }) => {
  const navigate = useNavigate();

  const navigateToProfile = () => navigate(`/profile/${user.id ?? 0}`);

  return (
    <StyledUserCard onClick={navigateToProfile}>
      {user?.avatar ? (
        <Avatar
          size={size}
          url={user.avatar ? `${user.avatar}?${Date.now()}` : undefined}
        />
      ) : (
        <AvatarPlaceholder size={size}>
          <i className="fa fa-user" />
        </AvatarPlaceholder>
      )}
      <Row>
        <Column>
          <Text
            mt="1rem"
            mb="0.5rem"
            ml="3rem"
            fontSize="1rem"
            fontWeight={600}
          >
            {user?.email}
          </Text>
          <Text ml="3rem" fontSize="1rem">
            {user?.name}
          </Text>
        </Column>
      </Row>
    </StyledUserCard>
  );
};

export const UserCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledUserCardList>{children}</StyledUserCardList>;
};

export default UserCard;
