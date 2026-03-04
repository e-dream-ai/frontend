import { DND_ACTIONS, DND_METADATA } from "@/constants/dnd.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
  MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { SetItemOrder } from "@/types/dnd.types";
import { Dream, DreamMediaType, DreamStatusType } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { Sizes } from "@/types/sizes.types";
import { Button } from "../button/button";
import Row, { Column } from "../row/row";
import {
  HighlightBorder,
  ItemCardAnchor,
  ItemTitleText,
  PlayButton,
  ReorderActionButton,
  ReorderActions,
  ReorderActionsWrap,
  StyledItemCard,
  StyledItemCardSkeleton,
  ThumbnailGrid,
  ThumbnailGridItem,
  ThumbnailPlaceholder,
  UsernameText,
} from "./item-card.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesDown,
  faAnglesUp,
  faChevronDown,
  faChevronUp,
  faEllipsis,
  faExclamationCircle,
  faFilm,
  faImage,
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
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { useImage } from "@/hooks/useImage";
import { useItemCardListState } from "../item-card-list/item-card-list";
import { HighlightPosition } from "@/types/item-card.types";
import { Keyframe } from "@/types/keyframe.types";
import { VirtualPlaylist } from "@/types/feed.types";
import Text from "../text/text";
import {
  getVirtualPlaylistThumbnailDreams,
  shouldVirtualPlaylistDisplayDots,
} from "@/utils/virtual-playlist.util";
import { ItemCardImage } from "./item-card-image";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { AnchorLink } from "@/components/shared";
import PlaylistPlay from "@/icons/playlist-play";
import { useNavigate } from "react-router-dom";

type DNDMode = "local" | "cross-window";
/**
 * "dream" - used to show dreams
 * "playlist" - used to show playlists
 * "keyframe" - used to show keyframes
 * "virtual-playlist" - used to show virtual playlists generated on frontend if dreams on feed shares same playlist
 */
export type ItemType = "dream" | "playlist" | "keyframe" | "virtual-playlist";

type Item = Dream | Omit<Playlist, "items"> | Keyframe | VirtualPlaylist;

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
  showOrderNumber?: boolean;
  indexNumber?: number;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  onOrder?: (dropItem: SetItemOrder) => void;
  onDelete?: (event: React.MouseEvent) => void;
  deleteTooltipId?: string;
  showReorderControls?: boolean;
  disableMoveToTop?: boolean;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  disableMoveToBottom?: boolean;
  onMoveToTop?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToBottom?: () => void;
};

const DND_MODES: { [key: string]: DNDMode } = {
  LOCAL: "local",
  CROSS_WINDOW: "cross-window",
} as const;

const TOUCH_HOLD_DELAY_MS = 260;
const TOUCH_MOVE_CANCEL_PX = 10;

const ROUTE_MAP = {
  dream: ROUTES.VIEW_DREAM,
  playlist: ROUTES.VIEW_PLAYLIST,
  keyframe: ROUTES.VIEW_KEYFRAME,
  "virtual-playlist": ROUTES.VIEW_PLAYLIST,
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
      return null;
    default:
      return null;
  }
};

const ItemCardComponent: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item,
  draggable = false,
  size = "md",
  deleteDisabled = false,
  inline = false,
  showPlayButton = false,
  showOrderNumber = false,
  indexNumber,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
  droppable = false,
  onClick,
  onOrder,
  onDelete,
  deleteTooltipId,
  showReorderControls = false,
  disableMoveToTop = false,
  disableMoveUp = false,
  disableMoveDown = false,
  disableMoveToBottom = false,
  onMoveToTop,
  onMoveUp,
  onMoveDown,
  onMoveToBottom,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const touchHoldTimeoutRef = useRef<number | null>(null);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const touchDraggingRef = useRef(false);
  const touchDragSourceOrderRef = useRef(order);
  const suppressNextClickRef = useRef(false);
  const { uuid, name, user, displayedOwner } = item ?? {};
  const thumbnail = useMemo(() => getThumbnail(type, item), [type, item]);
  const thumbnailDreams = useMemo(
    () => getVirtualPlaylistThumbnailDreams((item as VirtualPlaylist)?.dreams),
    [item],
  );

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
  const { isActive: isClientActive } = useDesktopClient();
  const { isDragging, setDragging, dragPreview, setDragPreview } =
    useItemCardListState();
  const navigate = useNavigate();

  /**
   * Handles highligth position 'top' or 'bottom'
   */
  const [highlightPosition, setHighlightPosition] =
    useState<HighlightPosition>();
  const [isTouchReorderActive, setIsTouchReorderActive] = useState(false);

  const [showClientNotConnectedModal, setShowClientNotConnectedModal] =
    useState<boolean>(false);

  const thumbnailUrl = useImage(thumbnail ?? "", {
    width: 420,
    fit: "cover",
  });

  /**
   * Generate a navigation route
   */
  const generateNavigationRoute = (): string | undefined => {
    // Get base route
    const baseRoute = ROUTE_MAP[type];
    if (!baseRoute || !item?.uuid) return undefined;

    // If item has a first dream child, add it to navigation as #ID
    const firstDream = thumbnailDreams?.[0];

    return firstDream
      ? `${baseRoute}/${item.uuid}#${firstDream.uuid}`
      : `${baseRoute}/${item.uuid}`;
  };

  const navigateRoute = generateNavigationRoute();

  const clearTouchHoldTimeout = useCallback(() => {
    if (touchHoldTimeoutRef.current) {
      window.clearTimeout(touchHoldTimeoutRef.current);
      touchHoldTimeoutRef.current = null;
    }
  }, []);

  const getTouchPreviewByCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const hoverElement = document
        .elementFromPoint(clientX, clientY)
        ?.closest(
          `[data-dnd-mode=\"${DND_MODES.LOCAL}\"][data-item-id][data-order]`,
        ) as HTMLElement | null;

      if (!hoverElement) {
        return undefined;
      }

      const hoveredItemId = Number(hoverElement.dataset.itemId);
      const hoveredOrder = Number(hoverElement.dataset.order);
      if (
        Number.isNaN(hoveredItemId) ||
        Number.isNaN(hoveredOrder) ||
        hoveredOrder < 0
      ) {
        return undefined;
      }

      const rect = hoverElement.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const position: HighlightPosition =
        relativeY < rect.height / 2 ? "top" : "bottom";

      return {
        itemId: hoveredItemId,
        order: hoveredOrder,
        position,
      };
    },
    [],
  );

  const clearTouchDraggingState = useCallback(() => {
    touchStartPositionRef.current = null;
    touchDraggingRef.current = false;
    setIsTouchReorderActive(false);
    setDragPreview(undefined);
    setDragging(false);
    clearTouchHoldTimeout();
  }, [clearTouchHoldTimeout, setDragPreview, setDragging]);

  const handlePlay: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (type === "dream") {
        emitPlayDream(socket, item as Dream);
      } else if (type == "playlist") {
        emitPlayPlaylist(socket, item as Playlist);
      } else if (type === "virtual-playlist") {
        emitPlayPlaylist(socket, item as Playlist);

        /**
         * When item is a `virtual-playlist` should play first thumbnail dream
         */
        const firstDream = thumbnailDreams?.[0];
        if (firstDream) {
          emitPlayDream(socket, firstDream);
        }
      }
    },
    [t, socket, item, type, thumbnailDreams, isClientActive, navigate],
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

      setDragPreview(undefined);
      setDragging(false);
      return false;
    },
    [setDragPreview, setDragging],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      /**
       * reset highlight position
       */
      setHighlightPosition(undefined);
      setDragPreview(undefined);
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
    [order, dndMode, onOrder, highlightPosition, itemId, setDragPreview],
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

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (
        !draggable ||
        dndMode !== DND_MODES.LOCAL ||
        !onOrder ||
        event.touches.length !== 1
      ) {
        return;
      }

      const isTouchPointer = window.matchMedia("(pointer: coarse)").matches;
      if (!isTouchPointer) {
        return;
      }

      const touch = event.touches[0];
      touchStartPositionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      touchDragSourceOrderRef.current = order;

      clearTouchHoldTimeout();
      touchHoldTimeoutRef.current = window.setTimeout(() => {
        touchDraggingRef.current = true;
        setIsTouchReorderActive(true);
        setDragging(true);
        suppressNextClickRef.current = true;
      }, TOUCH_HOLD_DELAY_MS);
    },
    [clearTouchHoldTimeout, dndMode, draggable, onOrder, order, setDragging],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!draggable || dndMode !== DND_MODES.LOCAL || !onOrder) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      if (!touchDraggingRef.current) {
        const start = touchStartPositionRef.current;
        if (!start) {
          return;
        }
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > TOUCH_MOVE_CANCEL_PX) {
          clearTouchHoldTimeout();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const preview = getTouchPreviewByCoordinates(
        touch.clientX,
        touch.clientY,
      );
      setDragPreview(preview);
    },
    [
      clearTouchHoldTimeout,
      dndMode,
      draggable,
      getTouchPreviewByCoordinates,
      onOrder,
      setDragPreview,
    ],
  );

  const completeTouchReorder = useCallback(
    (event: TouchEvent) => {
      if (!touchDraggingRef.current || dndMode !== DND_MODES.LOCAL) {
        clearTouchHoldTimeout();
        touchStartPositionRef.current = null;
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const changedTouch = event.changedTouches[0];
      const latestPreview = changedTouch
        ? getTouchPreviewByCoordinates(
            changedTouch.clientX,
            changedTouch.clientY,
          )
        : undefined;
      const finalPreview = latestPreview ?? dragPreview;

      if (finalPreview && finalPreview.itemId !== itemId) {
        const newIndexValue =
          (finalPreview.position === "top"
            ? finalPreview.order
            : finalPreview.order + 1) -
          (touchDragSourceOrderRef.current > finalPreview.order ? 0 : 1);

        if (newIndexValue !== touchDragSourceOrderRef.current) {
          onOrder?.({
            id: itemId,
            currentIndex: touchDragSourceOrderRef.current,
            newIndex: newIndexValue,
          });
        }
      }

      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 350);

      clearTouchDraggingState();
    },
    [
      clearTouchDraggingState,
      clearTouchHoldTimeout,
      dndMode,
      dragPreview,
      getTouchPreviewByCoordinates,
      itemId,
      onOrder,
    ],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => completeTouchReorder(event),
    [completeTouchReorder],
  );

  const handleTouchCancel = useCallback(() => {
    suppressNextClickRef.current = false;
    clearTouchDraggingState();
  }, [clearTouchDraggingState]);

  const registerEvents = useCallback(() => {
    cardRef.current?.addEventListener("dragstart", handleDragStart);
    cardRef.current?.addEventListener("dragenter", handleDragEnter);
    cardRef.current?.addEventListener("dragleave", handleDragLeave);
    cardRef.current?.addEventListener("dragend", handleDragEnd);
    cardRef.current?.addEventListener("drop", handleDrop);
    cardRef.current?.addEventListener("dragover", handleDragOver);
    cardRef.current?.addEventListener("touchstart", handleTouchStart);
    cardRef.current?.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    cardRef.current?.addEventListener("touchend", handleTouchEnd);
    cardRef.current?.addEventListener("touchcancel", handleTouchCancel);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  ]);

  const unregisterEvents = useCallback(() => {
    cardRef.current?.removeEventListener("dragstart", handleDragStart);
    cardRef.current?.removeEventListener("dragenter", handleDragEnter);
    cardRef.current?.removeEventListener("dragleave", handleDragLeave);
    cardRef.current?.removeEventListener("dragend", handleDragEnd);
    cardRef.current?.removeEventListener("drop", handleDrop);
    cardRef.current?.removeEventListener("dragover", handleDragOver);
    cardRef.current?.removeEventListener("touchstart", handleTouchStart);
    cardRef.current?.removeEventListener("touchmove", handleTouchMove);
    cardRef.current?.removeEventListener("touchend", handleTouchEnd);
    cardRef.current?.removeEventListener("touchcancel", handleTouchCancel);
  }, [
    cardRef,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  ]);

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  useEffect(() => {
    touchDragSourceOrderRef.current = order;
  }, [order]);

  useEffect(
    () => () => {
      clearTouchDraggingState();
    },
    [clearTouchDraggingState],
  );

  const isDreamFailed = useMemo(
    () =>
      type === "dream" && (item as Dream)?.status === DreamStatusType.FAILED,
    [type, item],
  );

  const Thumbnail = useMemo(
    () => () => {
      if (type === "virtual-playlist") {
        return (
          <ThumbnailGrid size={size}>
            {thumbnailDreams.map((dream, index) => {
              const dreamFailed = dream?.status === DreamStatusType.FAILED;
              return (
                <ThumbnailGridItem key={index}>
                  {dreamFailed ? (
                    <ThumbnailPlaceholder size={size}>
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        style={{ fontSize: "48px", color: "#ff4444" }}
                      />
                    </ThumbnailPlaceholder>
                  ) : (
                    <ItemCardImage size={size} src={dream.thumbnail} />
                  )}
                </ThumbnailGridItem>
              );
            })}
          </ThumbnailGrid>
        );
      }

      if (isDreamFailed) {
        return (
          <ThumbnailPlaceholder size={size}>
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{ fontSize: "64px", color: "#ff4444" }}
            />
          </ThumbnailPlaceholder>
        );
      }

      if (thumbnail) {
        return <ItemCardImage size={size} src={thumbnailUrl} />;
      }

      return (
        <ThumbnailPlaceholder size={size}>
          <FontAwesomeIcon icon={faPhotoFilm} />
        </ThumbnailPlaceholder>
      );
    },
    [type, thumbnail, thumbnailDreams, size, thumbnailUrl, isDreamFailed],
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
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PlaylistPlay />
                  </span>
                )
              }
              onClick={handlePlay}
            />
          </Row>
        )}

        {type == "virtual-playlist" &&
          shouldVirtualPlaylistDisplayDots(
            (item as VirtualPlaylist).dreams,
          ) && (
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
    [Thumbnail, handlePlay, item, type, inline, showPlayButton],
  );

  const onHideClientNotConnectedModal = () =>
    setShowClientNotConnectedModal(false);

  const handleReorderAction =
    (action?: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      action?.();
    };

  const handleCardClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      if (suppressNextClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressNextClickRef.current = false;
        return;
      }

      onClick?.(event);
    },
    [onClick],
  );

  const touchHighlightPosition =
    dragPreview?.itemId === itemId ? dragPreview.position : undefined;
  const activeHighlightPosition = touchHighlightPosition ?? highlightPosition;

  return (
    <>
      <ConfirmModal
        isOpen={showClientNotConnectedModal}
        onCancel={onHideClientNotConnectedModal}
        onConfirm={onHideClientNotConnectedModal}
        title={t("page.view_dream.client_not_connected_modal_title")}
        confirmText={t("page.view_dream.client_not_connected_modal_ok")}
        cancelText=""
        text={
          <Text>
            Start the app for the remote control, and try again.
            <br />
            <br />
            <AnchorLink to={ROUTES.INSTALL} type="primary">
              Install
            </AnchorLink>{" "}
            it first if needed.
            <br />
            <br />
            You can also play with the{" "}
            <AnchorLink to={ROUTES.REMOTE_CONTROL} type="primary">
              web client
            </AnchorLink>
            .
          </Text>
        }
      />
      <StyledItemCard
        data-element-uuid={uuid}
        data-item-id={itemId}
        data-order={order}
        data-dnd-mode={dndMode}
        data-touch-dragging={isTouchReorderActive}
        ref={cardRef}
        size={size}
        draggable={draggable && !isTouchReorderActive}
      >
        <>
          <ItemCardAnchor to={navigateRoute ?? ""} onClick={handleCardClick}>
            <Row
              flex="auto"
              margin="0"
              padding="3"
              justifyContent="space-between"
              flexDirection={["column", "row", "row", "row"]}
              style={{ position: "relative" }}
            >
              {(onDelete || showOrderNumber) && (
                <Row
                  alignItems="center"
                  m={0}
                  flexDirection={["row", "column", "column", "column"]}
                >
                  {onDelete && !deleteDisabled && (
                    <Button
                      type="button"
                      buttonType="danger"
                      transparent
                      onClick={onDelete}
                      style={{
                        fontSize: "1.6rem",
                        alignItems: "flex-start",
                      }}
                      data-tooltip-id={deleteTooltipId}
                    >
                      <FontAwesomeIcon
                        icon={faXmark}
                        style={{ paddingTop: 0 }}
                      />
                    </Button>
                  )}
                  {showOrderNumber && (
                    <Text
                      style={{
                        fontSize:
                          indexNumber && indexNumber >= 1000
                            ? "0.8rem"
                            : "1.2rem",
                        fontWeight: "bold",
                        color: theme.textBodyColor,
                        marginBottom: "4px",
                        marginRight: "6px",
                      }}
                    >
                      #{indexNumber}
                    </Text>
                  )}
                </Row>
              )}
              {inline && <ThumbnailAndPlayButton />}
              <Column
                flex="auto"
                margin="0"
                padding="0"
                justifyContent="center"
              >
                {!inline && <ThumbnailAndPlayButton />}
                <Row mb={0}>
                  <Column mr="3">
                    <Avatar size="sm" url={avatarUrl} />
                  </Column>
                  <Column justifyContent="center">
                    {/* card title */}
                    <ItemTitleText ref={tooltipRef} className="itemCard__title">
                      {type === "playlist" || type === "virtual-playlist" ? (
                        <FontAwesomeIcon icon={faListUl} />
                      ) : type === "dream" &&
                        (item as Dream)?.mediaType === DreamMediaType.IMAGE ? (
                        <FontAwesomeIcon icon={faImage} />
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
              {showReorderControls && (
                <ReorderActionsWrap>
                  <ReorderActions>
                    <ReorderActionButton
                      type="button"
                      onClick={handleReorderAction(onMoveToTop)}
                      disabled={disableMoveToTop}
                      aria-label={t("page.view_playlist.move_item_to_first")}
                      title={t("page.view_playlist.move_item_to_first")}
                    >
                      <FontAwesomeIcon icon={faAnglesUp} />
                    </ReorderActionButton>
                    <ReorderActionButton
                      type="button"
                      onClick={handleReorderAction(onMoveUp)}
                      disabled={disableMoveUp}
                      aria-label={t("page.view_playlist.move_item_up")}
                      title={t("page.view_playlist.move_item_up")}
                    >
                      <FontAwesomeIcon icon={faChevronUp} />
                    </ReorderActionButton>
                    <ReorderActionButton
                      type="button"
                      onClick={handleReorderAction(onMoveDown)}
                      disabled={disableMoveDown}
                      aria-label={t("page.view_playlist.move_item_down")}
                      title={t("page.view_playlist.move_item_down")}
                    >
                      <FontAwesomeIcon icon={faChevronDown} />
                    </ReorderActionButton>
                    <ReorderActionButton
                      type="button"
                      onClick={handleReorderAction(onMoveToBottom)}
                      disabled={disableMoveToBottom}
                      aria-label={t("page.view_playlist.move_item_to_last")}
                      title={t("page.view_playlist.move_item_to_last")}
                    >
                      <FontAwesomeIcon icon={faAnglesDown} />
                    </ReorderActionButton>
                  </ReorderActions>
                </ReorderActionsWrap>
              )}
            </Row>
          </ItemCardAnchor>
          {droppable && (
            <HighlightBorder
              isHighlighted={!!activeHighlightPosition}
              position={activeHighlightPosition}
              isFirst={order === 0}
            />
          )}
        </>
      </StyledItemCard>
    </>
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

const isVirtualPlaylist = (item: Item): item is VirtualPlaylist => {
  return item && "dreams" in item;
};

// Verifies if changes on item should rerender the component
const areItemsEqual = (
  prevItem: Item | undefined,
  nextItem: Item | undefined,
): boolean => {
  // If both items are undefined, considered it equal
  if (!prevItem && !nextItem) return true;

  // If one is undefined and the other isn't, they're not equal
  if (!prevItem || !nextItem) return false;

  // Check if both (prev and next item) are VirtualPlaylists and thumbnail dreams changes
  if (isVirtualPlaylist(prevItem) && isVirtualPlaylist(nextItem)) {
    const prevThumbnailDreams = getVirtualPlaylistThumbnailDreams(
      prevItem?.dreams,
    );
    const nextThumbnailDreams = getVirtualPlaylistThumbnailDreams(
      nextItem?.dreams,
    );

    // If every thumbnail dream is the same, then do not rerender
    return prevThumbnailDreams.every(
      (prevDream, index) => prevDream.id === nextThumbnailDreams[index]?.id,
    );
  }

  // If items has same uuid consider it equal
  if (prevItem.uuid === nextItem.uuid) {
    return true;
  }

  // If types don't match or aren't VirtualPlaylist, consider them not equal
  return false;
};

// Try rerender component only when order or some item properties changes
export const ItemCard = memo(
  ItemCardComponent,
  (prevProps, nextProps) =>
    prevProps.order === nextProps.order &&
    areItemsEqual(prevProps.item, nextProps.item),
);

export default ItemCard;
