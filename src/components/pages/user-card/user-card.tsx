import {
  Avatar,
  AvatarPlaceholder,
} from "@/components/shared/profile-card/profile-card.styled";
import Text from "@/components/shared/text/text";
import { User } from "@/types/auth.types";
import { StyledUserCard, StyledUserCardList } from "./user-card.styled";
import { Sizes } from "@/types/sizes.types";
import { Column, Row } from "@/components/shared";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/constants/routes.constants";
import { getUserName } from "@/utils/user.util";
import { generateImageURLFromResource } from "@/utils/image-handler";

const UserCard: React.FC<{ user: User; size: Sizes }> = ({ user, size }) => {
  const navigate = useNavigate();

  const navigateToProfile = () => navigate(`${ROUTES.PROFILE}/${user.id ?? 0}`);

  return (
    <StyledUserCard onClick={navigateToProfile}>
      {user?.avatar ? (
        <Avatar
          size={size}
          url={generateImageURLFromResource(user?.avatar, {
            width: 142,
            fit: "cover",
          })}
        />
      ) : (
        <AvatarPlaceholder size={size}>
          <FontAwesomeIcon icon={faUser} />
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
