import Text from "@/components/shared/text/text";
import { DND_ACTIONS, DND_METADATA } from "@/constants/dnd.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
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
  ItemCardBody,
  ItemCardImage,
  StyledItemCard,
  StyledItemCardList,
  ThumbnailPlaceholder,
} from "./item-card.styled";
import { FeedItemServerType } from "@/types/feed.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faListUl,
  faPhotoFilm,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";
import { generateImageURLFromResource } from "@/utils/image-handler";
import { useTheme } from "styled-components";

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
  onDelete?: (event: React.MouseEvent) => void;
  onOrder?: (dropItem: SetItemOrder) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item,
  size = "md",
  onDelete,
  deleteDisabled = false,
  onOrder,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { id, name, thumbnail, user } = item ?? {};
  const { t } = useTranslation();
  const theme = useTheme();

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);
  const [isMovedOnUpperHalf, setIsMovedOnUpperHalf] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);

  const navigateRoute = (item as Dream)?.uuid
    ? `${ROUTES.VIEW_DREAM}/${(item as Dream)?.uuid}`
    : `${ROUTES.VIEW_PLAYLIST}/${item?.id}`;

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
      <ItemCardAnchor to={navigateRoute}>
        <ItemCardBody isDragEntered={isDragEntered}>
          {thumbnail ? (
            <ItemCardImage
              size={size}
              draggable="false"
              src={generateImageURLFromResource(thumbnail, {
                width: 142,
                fit: "cover",
              })}
            />
          ) : (
            <ThumbnailPlaceholder size={size}>
              <FontAwesomeIcon icon={faPhotoFilm} />
            </ThumbnailPlaceholder>
          )}
          <Column ml={4}>
            <Text
              ref={tooltipRef}
              p={2}
              mb={2}
              color={
                type === "dream" ? theme.colorPrimary : theme.colorSecondary
              }
            >
              {type === "playlist" ? (
                <FontAwesomeIcon icon={faListUl} />
              ) : (
                <FontAwesomeIcon icon={faFilm} />
              )}{" "}
              {name || t("components.item_card.unnamed")}
            </Text>
            {(item as Playlist)?.itemCount ? (
              <Text mb={2}>
                {t("components.item_card.videos")}:{" "}
                {(item as Playlist)?.itemCount ?? 0}
              </Text>
            ) : (
              <></>
            )}
            <Text mb={2} p={2} color={theme.textSecondaryColor}>
              {t("components.item_card.owner")}
              {" - "}
              <Text color={theme.textPrimaryColor}>{getUserName(user)}</Text>
            </Text>
          </Column>
        </ItemCardBody>
        {onDelete && (
          <Row justifyContent="flex-start" ml={2} mb={0}>
            {!deleteDisabled && (
              <Button
                type="button"
                buttonType="danger"
                after={<FontAwesomeIcon icon={faTrash} />}
                transparent
                ml="1rem"
                onClick={onDelete}
              />
            )}
          </Row>
        )}
      </ItemCardAnchor>
    </StyledItemCard>
  );
};

export const ItemCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledItemCardList>{children}</StyledItemCardList>;
};

export default ItemCard;
