import Text from "components/shared/text/text";
import { DND_ACTIONS, DND_METADATA } from "constants/dnd.constants";
import { ROUTES } from "constants/routes.constants";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SetItemOrder } from "types/dnd.types";
import { Dream } from "types/dream.types";
import { Playlist } from "types/playlist.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import { Button } from "../button/button";
import Row, { Column } from "../row/row";
import {
  ItemCardBody,
  ItemCardImage,
  StyledItemCard,
  StyledItemCardList,
  ThumbnailPlaceholder,
} from "./item-card.styled";

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
  type?: "dream" | "playlist";
  item?: Dream | Omit<Playlist, "items">;
  size?: Sizes;
  dndMode?: DNDMode;
  order?: number;
  onDelete?: () => void;
  onOrder?: (dropItem: SetItemOrder) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item = {},
  size = "md",
  onDelete,
  onOrder,
  dndMode = DND_MODES.CROSS_WINDOW,
  order = 0,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const tooltipRef = useRef<HTMLAnchorElement>(null);
  const { id, name, thumbnail, user } = item;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);
  const [isMovedOnUpperHalf, setIsMovedOnUpperHalf] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);

  const navigateToItemPage = () => {
    if ("uuid" in item) navigate(`${ROUTES.VIEW_DREAM}/${item?.uuid}`);
    else navigate(`${ROUTES.VIEW_PLAYLIST}/${item?.id}`);
  };

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DND_METADATA.ACTION,
        dndMode === DND_MODES.LOCAL ? DND_ACTIONS.ORDER : DND_ACTIONS.ADD,
      );
      event?.dataTransfer?.setData(DND_METADATA.TYPE, type);
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

  const navigateToProfile = (id?: number) => () =>
    navigate(`/profile/${id ?? 0}`);

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
      <ItemCardBody isDragEntered={isDragEntered}>
        {thumbnail ? (
          <ItemCardImage
            size={size}
            draggable="false"
            src={thumbnail}
            onClick={navigateToItemPage}
          />
        ) : (
          <ThumbnailPlaceholder size={size} onClick={navigateToItemPage}>
            <i className="fa fa-picture-o" />
          </ThumbnailPlaceholder>
        )}
        <Column ml={4}>
          <Anchor
            ref={tooltipRef}
            type={type === "dream" ? "primary" : "secondary"}
            p={2}
            mb={2}
            onClick={navigateToItemPage}
          >
            {type === "playlist" ? (
              <i className="fa  fa-list-ul" />
            ) : (
              <i className="fa  fa-film" />
            )}{" "}
            {name || t("components.item_card.unnamed")}
          </Anchor>
          {"itemCount" in item ? (
            <Text mb={2}>
              {t("components.item_card.videos")}: {item?.itemCount ?? 0}
            </Text>
          ) : (
            <></>
          )}
          <Text mb={2} p={2}>
            {t("components.item_card.owner")}:{" "}
            <Anchor onClick={navigateToProfile(user?.id)}>{user?.email}</Anchor>
          </Text>
        </Column>
      </ItemCardBody>
      {onDelete && (
        <Row justifyContent="flex-start" ml={2} mb={0}>
          {/**
           * Menu hidden temporarily
           */}
          {/* <Menu
            menuButton={
              <MenuButton>
                <i className="fa fa-ellipsis-h" />
              </MenuButton>
            }
            transition
            menuClassName="my-menu"
          >
            <MenuItem onClick={() => onDelete()}>Delete</MenuItem>
          </Menu> */}

          <Button
            type="button"
            buttonType="danger"
            after={<i className="fa fa-trash" />}
            transparent
            ml="1rem"
            onClick={onDelete}
          />
        </Row>
      )}
    </StyledItemCard>
  );
};

export const ItemCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledItemCardList>{children}</StyledItemCardList>;
};
