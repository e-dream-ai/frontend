import { DND_ACTIONS, DND_METADATA } from "@/constants/dnd.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
  MouseEventHandler,
  useMemo,
  useCallback,
  useEffect,
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
  HighlightBorder,
  ItemCardAnchor,
  ItemCardImage,
  ItemTitleText,
  PlayButton,
  StyledItemCard,
  StyledItemCardSkeleton,
  ThumbnailPlaceholder,
  UsernameText,
} from "./item-card.styled";
import { FeedItemType } from "@/types/feed.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faListUl,
  faPhotoFilm,
  faPlay,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";
import { useTheme } from "styled-components";
import { Avatar } from "@/components/shared/avatar/avatar";
import { emitPlayDream, emitPlayPlaylist } from "@/utils/socket.util";
import useSocket from "@/hooks/useSocket";
import { useImage } from "@/hooks/useImage";
import { useItemCardListState } from "../item-card-list/item-card-list";
import { HighlightPosition } from "@/types/item-card.types";
import { Keyframe } from "@/types/keyframe.types";

type DNDMode = "local" | "cross-window";
export type ItemType = "dream" | "playlist" | "keyframe";

const DND_MODES: { [key: string]: DNDMode } = {
  LOCAL: "local",
  CROSS_WINDOW: "cross-window",
};

type ItemCardProps = {
  /**
   * item playlist id
   */
  itemId?: number;
  type?: ItemType;
  item?: Dream | Omit<Playlist, "items"> | Keyframe;
  draggable?: boolean;
  size?: Sizes;
  dndMode?: DNDMode;
  order?: number;
  deleteDisabled?: boolean;
  showPlayButton?: boolean;
  inline?: boolean;
  droppable?: boolean;
  onOrder?: (dropItem: SetItemOrder) => void;
  onDelete?: (event: React.MouseEvent) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item,
  draggable = false,
  size = "md",
  deleteDisabled = false,
  inline = false,
  showPlayButton = false,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
  droppable = false,
  onOrder,
  onDelete,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { uuid, name, user, displayedOwner } = item ?? {};
  const thumbnail = type === "dream" || type === "playlist"
    ? (item as Dream | Playlist)?.thumbnail
    : (item as Keyframe).image;

  const avatarUrl = useImage(
    displayedOwner ? displayedOwner?.avatar : user?.avatar,
    {
      width: 142,
      fit: "cover",
    },
  );
  const { t } = useTranslation();
  const theme = useTheme();
  const { socket } = useSocket();
  const { isDragging, setDragging } = useItemCardListState();

  /**
   * Handles highligth position 'top' or 'bottom'
   */
  const [highlightPosition, setHighlightPosition] =
    useState<HighlightPosition>();

  const thumbnailUrl = useImage(thumbnail, {
    width: 420,
    fit: "cover",
  });

  const navigateRoute =
    type === "dream"
      ? `${ROUTES.VIEW_DREAM}/${item?.uuid}`
      : type === "playlist" ? `${ROUTES.VIEW_PLAYLIST}/${item?.uuid}` : `${ROUTES.VIEW_KEYFRAME}/${item?.uuid}`;

  const handlePlay: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (type === FeedItemType.DREAM) {
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
    },
    [t, socket, item, type],
  );

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      /**
       * prevent drag
       */
      if (!draggable) {
        event.preventDefault();
        return;
      }

      setDragging(true);
      event?.dataTransfer?.setData(
        DND_METADATA.ACTION,
        dndMode === DND_MODES.LOCAL ? DND_ACTIONS.ORDER : DND_ACTIONS.ADD,
      );
      event?.dataTransfer?.setData(DND_METADATA.TYPE, type as string);
      event?.dataTransfer?.setData(DND_METADATA.UUID, uuid!);
      event?.dataTransfer?.setData(DND_METADATA.ITEM_ID, String(itemId));
      event?.dataTransfer?.setData(DND_METADATA.ORDER, String(order));
      event.dataTransfer?.setDragImage(tooltipRef.current as HTMLElement, 0, 0);
      return false;
    },
    [draggable, itemId, uuid, type, order, dndMode, setDragging],
  );

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isDragging) {
        return false;
      }
      return false;
    },
    [isDragging],
  );

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    /**
     * reset highlight position
     */
    setHighlightPosition(undefined);

    return false;
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setDragging(false);
      return false;
    },
    [setDragging],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      /**
       * reset highlight position
       */
      setHighlightPosition(undefined);
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
          (highlightPosition === "top" ? order : order + 1) -
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

      return false;
    },
    [order, dndMode, onOrder, highlightPosition, itemId],
  );

  const handleDragOver = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    /**
     *
     */
    const componentRect = (
      event?.currentTarget as HTMLDivElement
    ).getBoundingClientRect();

    const mouseY = event.clientY - componentRect.top;
    const newHighlightPosition =
      mouseY < componentRect.height / 2 ? "top" : "bottom";

    /**
     * set new highlight position
     */
    setHighlightPosition(newHighlightPosition);
  }, []);

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

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  const Thumbnail = useMemo(
    () => () =>
      thumbnail ? (
        <ItemCardImage size={size} src={thumbnailUrl} />
      ) : (
        <ThumbnailPlaceholder size={size}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </ThumbnailPlaceholder>
      ),
    [thumbnail, size, thumbnailUrl],
  );

  const ThumbnailAndPlayButton = useMemo(
    () => () => (
      <Row
        style={{ position: "relative" }}
        m={0}
        mb={3}
        mr={inline ? [0, 4, 4, 4] : 0}
        flex={["auto", 0, 0, 0]}
      >
        <Thumbnail />

        {showPlayButton && (
          <Row
            justifyContent="flex-end"
            mb="2"
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <PlayButton
              type="button"
              buttonType="default"
              transparent
              after={
                type === "dream" ? (
                  <FontAwesomeIcon icon={faPlay} />
                ) : (
                  <span className="fa-stack">
                    <FontAwesomeIcon icon={faPlay} />
                    <FontAwesomeIcon
                      icon={faPlay}
                      style={{ transform: "translate(-30%, 0%)" }}
                    />
                  </span>
                )
              }
              onClick={handlePlay}
            />
          </Row>
        )}
      </Row>
    ),
    [Thumbnail, handlePlay, type, inline, showPlayButton],
  );

  return (
    <StyledItemCard ref={cardRef} size={size} draggable={draggable}>
      <>
        <ItemCardAnchor to={navigateRoute}>
          <Row
            flex="auto"
            margin="0"
            padding="3"
            justifyContent="space-between"
            flexDirection={["column", "row", "row", "row"]}
          >
            {onDelete && (
              <Row alignItems="flex-start" m={0}>
                {!deleteDisabled && (
                  <Button
                    type="button"
                    buttonType="danger"
                    transparent
                    onClick={onDelete}
                    style={{
                      fontSize: "1.6rem",
                      alignItems: "flex-start",
                      padding: "0rem 1rem 0rem 0rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} style={{ paddingTop: 0 }} />
                  </Button>
                )}
              </Row>
            )}
            {inline && <ThumbnailAndPlayButton />}
            <Column flex="auto" margin="0" padding="0" justifyContent="center">
              {!inline && <ThumbnailAndPlayButton />}
              <Row mb={0}>
                <Column mr="3">
                  <Avatar size="sm" url={avatarUrl} />
                </Column>
                <Column justifyContent="center">
                  {/* card title */}
                  <ItemTitleText ref={tooltipRef} className="itemCard__title">
                    {type === "playlist" ? (
                      <FontAwesomeIcon icon={faListUl} />
                    ) : (
                      <FontAwesomeIcon icon={faFilm} />
                    )}{" "}
                    {name || t("components.item_card.unnamed")}
                  </ItemTitleText>

                  {/* user name */}
                  <UsernameText color={theme.textPrimaryColor} mt="2">
                    {getUserName(displayedOwner ?? user)}
                  </UsernameText>
                </Column>
              </Row>
            </Column>
          </Row>
        </ItemCardAnchor>
        {droppable && (
          <HighlightBorder
            isHighlighted={!!highlightPosition}
            position={highlightPosition}
          />
        )}
      </>
    </StyledItemCard>
  );
};

type ItemCardSkeletonProps = {
  size?: Sizes;
  children?: React.ReactNode;
};
export const ItemCardSkeleton: React.FC<ItemCardSkeletonProps> = ({
  size = "md",
  children,
}) => <StyledItemCardSkeleton size={size}>{children}</StyledItemCardSkeleton>;

export default ItemCard;
