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
  PlayButton,
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
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getUserName } from "@/utils/user.util";
import { useTheme } from "styled-components";
import { Avatar } from "@/components/shared/avatar/avatar";
import { emitPlayDream, emitPlayPlaylist } from "@/utils/socket.util";
import useSocket from "@/hooks/useSocket";
import { useImage } from "@/hooks/useImage";

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
  inline?: boolean;
  onOrder?: (dropItem: SetItemOrder) => void;
  onDelete?: (event: React.MouseEvent) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item,
  size = "md",
  deleteDisabled = false,
  showPlayButton = false,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
  onOrder,
  onDelete,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { id, name, thumbnail, user, displayedOwner } = item ?? {};
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

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);
  const [isMovedOnUpperHalf, setIsMovedOnUpperHalf] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);

  const thumbnailUrl = useImage(thumbnail, {
    width: 420,
    fit: "cover",
  });

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

  const Thumbnail = () =>
    thumbnail ? (
      <ItemCardImage size={size} draggable="false" src={thumbnailUrl} />
    ) : (
      <ThumbnailPlaceholder size={size}>
        <FontAwesomeIcon icon={faPhotoFilm} />
      </ThumbnailPlaceholder>
    );

  return (
    <StyledItemCard
      ref={cardRef}
      size={size}
      draggable="true"
      isDragEntered={isDragEntered}
      isMovedOnUpperHalf={isMovedOnUpperHalf}
    >
      <ItemCardAnchor to={navigateRoute} isDragEntered={isDragEntered}>
        <Column
          flex="auto"
          margin="0"
          padding="3"
          justifyContent="space-between"
          flexWrap={["wrap", "nowrap", "nowrap", "nowrap"]}
        >
          {onDelete && (
            <Row justifyContent="flex-end" mb={2}>
              {!deleteDisabled && (
                <Button
                  type="button"
                  buttonType="danger"
                  after={<FontAwesomeIcon icon={faXmark} />}
                  transparent
                  onClick={onDelete}
                />
              )}
            </Row>
          )}
          <Column flex="auto" margin="0" padding="0" justifyContent="center">
            <Row mb="3" flex="auto" style={{ position: "relative" }}>
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
                    after={<FontAwesomeIcon icon={faPlay} />}
                    onClick={handlePlay}
                  />
                </Row>
              )}
            </Row>

            <Row>
              <Column mr="3">
                <Avatar size="sm" url={avatarUrl} />
              </Column>
              <Column justifyContent="center">
                {/* card title */}
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
                  {name || t("components.item_card.unnamed")}
                </ItemTitleText>

                {/* user name */}
                <UsernameText color={theme.textPrimaryColor} mt="2">
                  {getUserName(displayedOwner ?? user)}
                </UsernameText>
              </Column>
            </Row>
          </Column>
        </Column>
      </ItemCardAnchor>
    </StyledItemCard>
  );
};

export const ItemCardList = StyledItemCardList;

export default ItemCard;
