import { DND_ACTIONS, DND_METADATA } from "@/constants/dnd.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SetItemOrder } from "@/types/dnd.types";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { Sizes } from "@/types/sizes.types";
import { Button } from "../button/button";
import Row, { Column } from "../row/row";
import {
  ItemCardAnchor,
  ItemCardImage,
  ItemTitleText,
  StyledItemCard,
  StyledItemCardList,
  ThumbnailPlaceholder,
  UsernameText,
} from "./item-card.styled";
import { FeedItemServerType } from "@/types/feed.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faListUl,
  faPhotoFilm,
  faPlay,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";
import { generateImageURLFromResource } from "@/utils/image-handler";
import { useTheme } from "styled-components";
import { Avatar } from "@/components/shared/avatar/avatar";
import { emitPlayDream, emitPlayPlaylist } from "@/utils/socket.util";
import useSocket from "@/hooks/useSocket";

type DNDMode = "local" | "cross-window";

const DND_MODES: { [key: string]: DNDMode } = {
  LOCAL: "local",
  CROSS_WINDOW: "cross-window",
};

type ItemCardProps = {
  /**
   * item playlist id
   */
  itemId?: number;
  type?: FeedItemServerType;
  item?: Dream | Omit<Playlist, "items">;
  size?: Sizes;
  dndMode?: DNDMode;
  order?: number;
  deleteDisabled?: boolean;
  showPlayButton?: boolean;
  onOrder?: (dropItem: SetItemOrder) => void;
  onDelete?: (event: React.MouseEvent) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item,
  size = "md",
  deleteDisabled = false,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
  showPlayButton = false,
  onOrder,
  onDelete,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { id, name, thumbnail, user } = item ?? {};
  const { t } = useTranslation();
  const theme = useTheme();
  const { socket } = useSocket();

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);
  const [isMovedOnUpperHalf, setIsMovedOnUpperHalf] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);

  const navigateRoute = (item as Dream)?.uuid
    ? `${ROUTES.VIEW_DREAM}/${(item as Dream)?.uuid}`
    : `${ROUTES.VIEW_PLAYLIST}/${item?.id}`;

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    event?.preventDefault();
    if ((item as Dream)?.uuid) {
      emitPlayDream(
        socket,
        item as Dream,
        t("toasts.play_dream", { name: (item as Dream)?.name }),
      );
    } else {
      emitPlayPlaylist(
        socket,
        item as Playlist,
        t("toasts.play_playlist", { name: (item as Playlist)?.name }),
      );
    }
  };

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DND_METADATA.ACTION,
        dndMode === DND_MODES.LOCAL ? DND_ACTIONS.ORDER : DND_ACTIONS.ADD,
      );
      event?.dataTransfer?.setData(DND_METADATA.TYPE, type as string);
      event?.dataTransfer?.setData(DND_METADATA.ID, String(id));
      event?.dataTransfer?.setData(DND_METADATA.ITEM_ID, String(itemId));
      event?.dataTransfer?.setData(DND_METADATA.ORDER, String(order));
      event.dataTransfer?.setDragImage(tooltipRef.current as HTMLElement, 0, 0);
      return false;
    },
    [itemId, id, type, order, dndMode],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.stopImmediatePropagation();
      if (dndMode === DND_MODES.LOCAL) {
        setIsDragEntered(true);
      }
      return false;
    },
    [dndMode],
  );

  const handleDragLeave = useCallback(() => {
    if (dndMode === DND_MODES.LOCAL) {
      setIsDragEntered(false);
    }
    return false;
  }, [dndMode]);

  const handleDragEnd = useCallback(() => {
    if (dndMode === DND_MODES.LOCAL) {
      setIsDragEntered(false);
    }
    return false;
  }, [dndMode]);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event?.preventDefault();
      const dt = event.dataTransfer;
      const action = dt?.getData(DND_METADATA.ACTION);
      const dropOrder = Number(dt?.getData(DND_METADATA.ORDER)) ?? 0;
      const dropItemId = Number(dt?.getData(DND_METADATA.ITEM_ID)) ?? 0;

      if (
        dndMode === "local" &&
        action === DND_ACTIONS.ORDER &&
        dropItemId === itemId
      ) {
        /**
         * if drag and drop item is same, do nothing
         */
        return false;
      } else if (dndMode === "local" && action === DND_ACTIONS.ORDER) {
        const newIndexValue =
          /**
           * if item was drag upperhalf, set current order, else increase one to current order
           */
          (isMovedOnUpperHalf ? order : order + 1) -
          /**
           * if drop order is over current order, not decrease one, else, decrease one to set correct order
           */
          (dropOrder > order ? 0 : 1);
        const dropItem: SetItemOrder = {
          id: dropItemId,
          currentIndex: dropOrder,
          newIndex: newIndexValue,
        };
        onOrder?.(dropItem);
      }

      setIsDragEntered(false);
      return false;
    },
    [order, dndMode, onOrder, isMovedOnUpperHalf, itemId],
  );

  const handleDragOver = useCallback(
    (e: MouseEvent) => {
      const y = e.pageY - (cardRef?.current?.offsetTop ?? 0);
      /**
       * Define if drag is on the upperhalf of the card
       */
      const value = y / height < 0.5;
      if (value !== isMovedOnUpperHalf) {
        setIsMovedOnUpperHalf(value);
      }
    },
    [height, isMovedOnUpperHalf],
  );

  const registerEvents = useCallback(() => {
    cardRef.current?.addEventListener("dragstart", handleDragStart);
    cardRef.current?.addEventListener("dragenter", handleDragEnter);
    cardRef.current?.addEventListener("dragleave", handleDragLeave);
    cardRef.current?.addEventListener("dragend", handleDragEnd);
    cardRef.current?.addEventListener("drop", handleDrop);
    cardRef.current?.addEventListener("dragover", handleDragOver);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDragOver,
  ]);

  const unregisterEvents = useCallback(() => {
    cardRef.current?.removeEventListener("dragstart", handleDragStart);
    cardRef.current?.removeEventListener("dragenter", handleDragEnter);
    cardRef.current?.removeEventListener("dragleave", handleDragLeave);
    cardRef.current?.removeEventListener("dragend", handleDragEnd);
    cardRef.current?.removeEventListener("drop", handleDrop);
    cardRef.current?.removeEventListener("dragover", handleDragOver);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDragOver,
  ]);

  useLayoutEffect(() => {
    setHeight(cardRef.current?.clientHeight ?? 0);
  }, [cardRef]);

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  return (
    <StyledItemCard
      ref={cardRef}
      size={size}
      draggable="true"
      isDragEntered={isDragEntered}
      isMovedOnUpperHalf={isMovedOnUpperHalf}
    >
      <ItemCardAnchor to={navigateRoute} isDragEntered={isDragEntered}>
        <Row flex="auto" margin="0" padding="3" justifyContent="space-between">
          <Row
            flex="auto"
            margin="0"
            padding="0"
            justifyContent="space-between"
          >
            <Column mr={["2", "2", "3", "3"]} flex="auto">
              <Row flex="auto" margin="0" mb="3">
                <ItemTitleText
                  ref={tooltipRef}
                  color={
                    type === "dream" ? theme.colorPrimary : theme.colorSecondary
                  }
                >
                  {type === "playlist" ? (
                    <FontAwesomeIcon icon={faListUl} />
                  ) : (
                    <FontAwesomeIcon icon={faFilm} />
                  )}{" "}
                  {/* {truncateString(name, 60, true) ||
                    t("components.item_card.unnamed")} */}
                  {name || t("components.item_card.unnamed")}
                </ItemTitleText>
              </Row>
              <Row margin="0">
                {thumbnail ? (
                  <ItemCardImage
                    size={size}
                    draggable="false"
                    src={generateImageURLFromResource(thumbnail, {
                      width: 420,
                      fit: "cover",
                    })}
                  />
                ) : (
                  <ThumbnailPlaceholder size={size}>
                    <FontAwesomeIcon icon={faPhotoFilm} />
                  </ThumbnailPlaceholder>
                )}
              </Row>
            </Column>
            <Column justifyContent="center">
              {showPlayButton && (
                <Column alignItems="flex-end" mb="3">
                  <Button
                    type="button"
                    buttonType="default"
                    transparent
                    after={<FontAwesomeIcon icon={faPlay} />}
                    onClick={handlePlay}
                  />
                </Column>
              )}
              <Column alignItems="center">
                <Avatar
                  size={size === "lg" ? "md" : "sm"}
                  url={generateImageURLFromResource(user?.avatar, {
                    width: 142,
                    fit: "cover",
                  })}
                />
                <UsernameText color={theme.textPrimaryColor} mt="2">
                  {getUserName(user)}
                </UsernameText>
              </Column>
            </Column>
          </Row>
          {onDelete && (
            <Column justifyContent="flex-start" ml="4">
              {!deleteDisabled && (
                <Button
                  type="button"
                  buttonType="danger"
                  after={<FontAwesomeIcon icon={faTrash} />}
                  transparent
                  onClick={onDelete}
                />
              )}
            </Column>
          )}
        </Row>
      </ItemCardAnchor>
    </StyledItemCard>
  );
};

export const ItemCardList = StyledItemCardList;

export default ItemCard;
