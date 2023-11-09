import Text from "components/shared/text/text";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { MouseEventHandler, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dream } from "types/dream.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import { Button } from "../button/button";
import {
  MediaItemCardBody,
  MediaItemCardImage,
  StyledMediaItemCard,
  StyledMediaItemCardList,
  ThumbnailPlaceholder,
} from "../media-item-card/media-item-card";
import Row from "../row/row";

type DreamCardProps = {
  dream: Dream;
  size?: Sizes;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  size = "md",
  onDelete,
}) => {
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
    <StyledMediaItemCard
      ref={cardRef}
      draggable="true"
      onClick={navigateToDream(uuid)}
    >
      {thumbnail ? (
        <MediaItemCardImage size={size} draggable="false" src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder size={size}>
          <i className="fa fa-picture-o" />
        </ThumbnailPlaceholder>
      )}
      <MediaItemCardBody>
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
      </MediaItemCardBody>
      {onDelete && (
        <Row justifyContent="flex-end" ml={1}>
          <Button type="button" onClick={onDelete}>
            <i className="fa fa-trash" />
          </Button>
        </Row>
      )}
    </StyledMediaItemCard>
  );
};

export const DreamCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledMediaItemCardList>{children}</StyledMediaItemCardList>;
};
