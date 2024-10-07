import { Avatar } from "@/components/shared/avatar/avatar";
import Text from "@/components/shared/text/text";
import { User } from "@/types/auth.types";
import { StyledUserCard, StyledUserCardList } from "./user-card.styled";
import { Sizes } from "@/types/sizes.types";
import { Column, Row } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { getUserName } from "@/utils/user.util";
import { useImage } from "@/hooks/useImage";

const UserCard: React.FC<{ user: User; size: Sizes }> = ({ user, size }) => {
  const navigate = useNavigate();

  const navigateToProfile = () => navigate(`${ROUTES.PROFILE}/${user.uuid}`);

  const avatarUrl = useImage(user?.avatar, {
    width: 142,
    fit: "cover",
  });

  return (
    <StyledUserCard onClick={navigateToProfile}>
      <Avatar size={size} url={avatarUrl} />
      <Row>
        <Column>
          <Text
            mt="1rem"
            mb="0.5rem"
            ml="3rem"
            fontSize="1rem"
            fontWeight={600}
          >
            {getUserName(user)}
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
