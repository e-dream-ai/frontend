import { Avatar } from "components/shared/profile-card/profile-card.styled";
import Text from "components/shared/text/text";
import { User } from "types/auth.types";
import { StyledUserCard, StyledUserCardList } from "./user-card.styled";
import { Sizes } from "types/sizes.types";
import { Column, Row } from "components/shared";

const UserCard: React.FC<{ user: User; size: Sizes }> = ({ user, size }) => {
  return (
    <StyledUserCard>
      <Avatar
        size={size}
        url={user.avatar ? `${user.avatar}?${Date.now()}` : undefined}
      />
      <Row>
        <Column>
          <Text
            mt="1rem"
            mb="0.5rem"
            ml="1rem"
            fontSize="1rem"
            fontWeight={600}
          >
            {user?.email}
          </Text>
          <Text ml="1rem" fontSize="1rem">
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
