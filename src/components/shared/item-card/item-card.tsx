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
  ThumbnailGrid,
  ThumbnailGridItem,
  ThumbnailPlaceholder,
  UsernameText,
} from "./item-card.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
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
import { PlaylistWithDreams } from "@/types/feed.types";
import Text from "../text/text";

type DNDMode = "local" | "cross-window";
/**
 * "dream" - used to show dreams
 * "playlist" - used to show playlists
 * "keyframe" - used to show keyframes
 * "virtual-playlist" - used to show virtual playlists generated on frontend if dreams on feed shares same playlist
 */
export type ItemType = "dream" | "playlist" | "keyframe" | "virtual-playlist";

type Item = Dream | Omit<Playlist, "items"> | Keyframe | PlaylistWithDreams;

type ItemCardProps = {
  /**
   * item playlist id
   */
  itemId?: number;
  type?: ItemType;
  item?: Item;
  draggable?: boolean;
  size?: Sizes;
  dndMode?: DNDMode;
  order?: number;
  deleteDisabled?: boolean;
  showPlayButton?: boolean;
  inline?: boolean;
  droppable?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onOrder?: (dropItem: SetItemOrder) => void;
  onDelete?: (event: React.MouseEvent) => void;
};

const DND_MODES: { [key: string]: DNDMode } = {
  LOCAL: "local",
  CROSS_WINDOW: "cross-window",
} as const;

const ROUTE_MAP = {
  "dream": ROUTES.VIEW_DREAM,
  "playlist": ROUTES.VIEW_PLAYLIST,
  "keyframe": ROUTES.VIEW_KEYFRAME,
  "virtual-playlist": undefined
} as const;

const getThumbnail = (type: string, item?: Item) => {
  switch (type) {
    case "dream":
      return (item as Dream)?.thumbnail;
    case "playlist":
      return (item as Playlist)?.thumbnail;
    case "keyframe":
      return (item as Keyframe)?.image;
    case "virtual-playlist":
      return null
    default:
      return null;
  }
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
  onClick,
  onOrder,
  onDelete,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { uuid, name, user, displayedOwner } = item ?? {};
  const thumbnail = getThumbnail(type, item);

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

  const thumbnailUrl = useImage(thumbnail ?? "", {
    width: 420,
    fit: "cover",
  });

  const navigateRoute = ROUTE_MAP[type] && `${ROUTE_MAP[type]}/${item?.uuid}`;

  const handlePlay: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (type === "dream") {
        emitPlayDream(
          socket,
          item as Dream,
          t("toasts.play_dream", { name: (item as Dream)?.name }),
        );
      } else if (type == "playlist") {
        emitPlayPlaylist(
          socket,
          item as Playlist,
          t("toasts.play_playlist", { name: (item as Playlist)?.name }),
        );
      } else if (type === "virtual-playlist") {
        emitPlayPlaylist(
          socket,
          item as Playlist,
          t("toasts.play_playlist", { name: (item as PlaylistWithDreams)?.name }),
        );

        const firstDream = (item as PlaylistWithDreams).dreams?.[0];
        if (firstDream) {
          emitPlayDream(
            socket,
            firstDream,
            t("toasts.play_dream", { name: firstDream.name }),
          );
        }
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
    () => () => {

      if (type === 'virtual-playlist') {
        const gridDreams = (item as PlaylistWithDreams).dreams.slice(0, 4);
        return (
          <ThumbnailGrid size={size}>
            {gridDreams.map((dream, index) => (
              <ThumbnailGridItem key={index}>
                <ItemCardImage
                  size={size}
                  src={dream.thumbnail}
                />
              </ThumbnailGridItem>
            ))}
          </ThumbnailGrid>
        );
      }

      if (thumbnail) {
        return <ItemCardImage size={size} src={thumbnailUrl} />
      }

      return (
        <ThumbnailPlaceholder size={size}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </ThumbnailPlaceholder>
      )
    },
    [item, type, thumbnail, size, thumbnailUrl],
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
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <PlayButton
              type="button"
              buttonType="default"
              transparent
              playType={type}
              after={
                type === "dream" ? (
                  <span>
                    <FontAwesomeIcon icon={faPlay} />
                  </span>
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

        {type == "virtual-playlist" && (
          <Row
            justifyContent="flex-end"
            style={{ position: "absolute", bottom: 0, right: 0 }}
            mb="0"
          >
            <Text mr="1rem" fontSize="2rem">
              <FontAwesomeIcon icon={faEllipsis} />
            </Text>
          </Row>
        )}
      </Row>
    ),
    [Thumbnail, handlePlay, type, inline, showPlayButton],
  );

  return (
    <StyledItemCard ref={cardRef} size={size} draggable={draggable}>
      <>
        <ItemCardAnchor to={navigateRoute ?? ""} onClick={onClick}>
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
