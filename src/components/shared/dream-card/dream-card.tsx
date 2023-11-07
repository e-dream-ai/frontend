import Text from "components/shared/text/text";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dream } from "types/dream.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import {
  DreamCardBody,
  DreamCardImage,
  StyledDreamCard,
  StyledDreamCardList,
  ThumbnailPlaceholder,
} from "./dream-card.styled";

type DreamCardProps = {
  dream: Dream;
  size?: Sizes;
};

// const EVENTS = {
//   DRAG_START: "dragstart",
// };

export const DreamCard: React.FC<DreamCardProps> = ({ dream, size = "md" }) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const { name, uuid, thumbnail, created_at, user } = dream;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigateToDream = (uuid: string) => () =>
    navigate(`${ROUTES.VIEW_DREAM}/${uuid}`);

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DRAG_DROP_FORMAT.TYPE,
        DRAG_DROP_FORMAT.DREAM,
      );
      event?.dataTransfer?.setData(DRAG_DROP_FORMAT.ID, String(dream.id));
      return true;
    },
    [dream.id],
  );

  const registerEvents = useCallback(() => {
    cardRef.current?.addEventListener("dragstart", handleDragStart);
  }, [cardRef, handleDragStart]);

  const unregisterEvents = useCallback(() => {
    cardRef.current?.removeEventListener("dragstart", handleDragStart);
  }, [cardRef, handleDragStart]);

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  return (
    <StyledDreamCard
      ref={cardRef}
      draggable="true"
      onClick={navigateToDream(uuid)}
    >
      {thumbnail ? (
        <DreamCardImage size={size} draggable="false" src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder size={size}>
          <i className="fa fa-picture-o" />
        </ThumbnailPlaceholder>
      )}
      <DreamCardBody>
        <Anchor onClick={navigateToDream(uuid)}>
          {name || "Unnamed dream"}
        </Anchor>
        <Text>
          {t("components.dream_card.created_at")}:{" "}
          {moment(created_at).format(FORMAT)}
        </Text>
        <Text>
          {t("components.dream_card.owner")}: {user?.email}
        </Text>
      </DreamCardBody>
    </StyledDreamCard>
  );
};

export const DreamCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledDreamCardList>{children}</StyledDreamCardList>;
};
