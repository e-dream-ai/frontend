import Text from "components/shared/text/text";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Dream } from "types/dream.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import { Button } from "../button/button";
import {
  MediaItemCardBody,
  MediaItemCardContainer,
  MediaItemCardImage,
  StyledMediaItemCard,
  StyledMediaItemCardList,
  ThumbnailPlaceholder,
} from "../media-item-card/media-item-card";
import Row from "../row/row";

type DNDMode = "local" | "cross-window";

type DreamCardProps = {
  dream: Dream;
  size?: Sizes;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
  dndMode?: DNDMode;
  hint?: boolean;
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  size = "md",
  onDelete,
  dndMode = "cross-browser",
  hint = false,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const { name, uuid, thumbnail, created_at, user } = dream;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);

  const navigateToDream = (uuid: string) => () =>
    navigate(`${ROUTES.VIEW_DREAM}/${uuid}`);

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DRAG_DROP_FORMAT.TYPE,
        DRAG_DROP_FORMAT.DREAM,
      );
      event?.dataTransfer?.setData(DRAG_DROP_FORMAT.ID, String(dream.id));
      return false;
    },
    [dream.id],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.stopImmediatePropagation();
      if (dndMode === "local") {
        setIsDragEntered(true);
      }
      return false;
    },
    [dndMode],
  );

  const handleDragLeave = useCallback(() => {
    if (dndMode === "local") {
      setIsDragEntered(false);
    }
    return false;
  }, [dndMode]);

  const handleDragEnd = useCallback(() => {
    if (dndMode === "local") {
      setIsDragEntered(false);
    }
    return false;
  }, [dndMode]);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      if (dndMode === "local") {
        setIsDragEntered(false);
        toast.success(`Playlist ordered sucessfully.`);
      }
      return false;
    },
    [dndMode],
  );

  const registerEvents = useCallback(() => {
    cardRef.current?.addEventListener("dragstart", handleDragStart);
    cardRef.current?.addEventListener("dragenter", handleDragEnter);
    cardRef.current?.addEventListener("dragleave", handleDragLeave);
    cardRef.current?.addEventListener("dragend", handleDragEnd);
    cardRef.current?.addEventListener("drop", handleDrop);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  ]);

  const unregisterEvents = useCallback(() => {
    cardRef.current?.removeEventListener("dragstart", handleDragStart);
    cardRef.current?.removeEventListener("dragenter", handleDragEnter);
    cardRef.current?.removeEventListener("dragleave", handleDragLeave);
    cardRef.current?.removeEventListener("dragend", handleDragEnd);
    cardRef.current?.removeEventListener("drop", handleDrop);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  ]);

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  console.log({ isDragEntered });

  return (
    <StyledMediaItemCard
      ref={cardRef}
      draggable="true"
      onClick={navigateToDream(uuid)}
      isDragEntered={isDragEntered}
    >
      <MediaItemCardContainer onClick={(event) => event.stopPropagation()}>
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
      </MediaItemCardContainer>
    </StyledMediaItemCard>
  );
};

export const DreamCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledMediaItemCardList>{children}</StyledMediaItemCardList>;
};
