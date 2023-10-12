import Text from "components/shared/text/text";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Dream } from "types/dream.types";
import Anchor from "../anchor/anchor";
import {
  DreamCardBody,
  DreamCardImage,
  StyledDreamCard,
  ThumbnailPlaceholder,
} from "./dream-card.styled";

type DreamCardProps = {
  dream: Dream;
};

export const DreamCard: React.FC<DreamCardProps> = ({ dream }) => {
  const { name, uuid, thumbnail, created_at, user } = dream;
  const navigate = useNavigate();
  const navigateToDream = (uuid: string) => () =>
    navigate(`${ROUTES.VIEW_DREAM}/${uuid}`);

  return (
    <StyledDreamCard onClick={navigateToDream(uuid)}>
      {thumbnail ? (
        <DreamCardImage src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder>
          <i className="fa fa-picture-o" />
        </ThumbnailPlaceholder>
      )}
      <DreamCardBody>
        <Anchor onClick={navigateToDream(uuid)}>
          {name || "Unnamed dream"}
        </Anchor>
        <Text>Created at: {moment(created_at).format(FORMAT)}</Text>
        <Text>Owner: {user?.email}</Text>
      </DreamCardBody>
    </StyledDreamCard>
  );
};

export const DreamCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ul>{children}</ul>;
};
