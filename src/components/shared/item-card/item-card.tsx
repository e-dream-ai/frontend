import Text from "components/shared/text/text";
import { DND_ACTIONS, DND_METADATA } from "constants/dnd.constants";
import { ROUTES } from "constants/routes.constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OrderedItem } from "types/dnd.types";
import { Dream } from "types/dream.types";
import { Playlist } from "types/playlist.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import { Menu, MenuButton, MenuItem } from "../menu/menu";
import Row, { Column } from "../row/row";
import {
  ItemCardBody,
  ItemCardImage,
  StyledItemCard,
  StyledItemCardList,
  ThumbnailPlaceholder,
} from "./item-card.styled";

type DNDMode = "local" | "cross-window";

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
  onOrder?: (orderedItems: OrderedItem[]) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  itemId = 0,
  type = "dream",
  item = {},
  size = "md",
  onDelete,
  onOrder,
  dndMode = "cross-browser",
  order = 0,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const { id, name, thumbnail, user } = item;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isDragEntered, setIsDragEntered] = useState<boolean>(false);

  const navigateToItemPage = () => {
    if ("uuid" in item) navigate(`${ROUTES.VIEW_DREAM}/${item?.uuid}`);
    else navigate(`${ROUTES.VIEW_PLAYLIST}/${item?.id}`);
  };

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DND_METADATA.ACTION,
        dndMode === "local" ? DND_ACTIONS.ORDER : DND_ACTIONS.ADD,
      );
      event?.dataTransfer?.setData(DND_METADATA.TYPE, type);
      event?.dataTransfer?.setData(
        DND_METADATA.ID,
        dndMode === "local" ? String(itemId) : String(id),
      );
      event?.dataTransfer?.setData(DND_METADATA.ORDER, String(order));
      return false;
    },
    [itemId, id, type, order, dndMode],
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
      event?.preventDefault();
      const dt = event.dataTransfer;
      const action = dt?.getData(DND_METADATA.ACTION);

      if (dndMode === "local" && action === DND_ACTIONS.ORDER) {
        const dropOrder = Number(dt?.getData(DND_METADATA.ORDER)) ?? 0;
        const dropId = Number(dt?.getData(DND_METADATA.ID)) ?? 0;
        const dragItem: OrderedItem = { id: itemId, order: dropOrder };
        const dropItem: OrderedItem = { id: dropId, order };
        const orderedItems: OrderedItem[] = [dragItem, dropItem];
        onOrder?.(orderedItems);
      }

      setIsDragEntered(false);
      return false;
    },
    [itemId, order, dndMode, onOrder],
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

  return (
    <StyledItemCard
      ref={cardRef}
      size={size}
      draggable="true"
      isDragEntered={isDragEntered}
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
            type={type === "dream" ? "primary" : "secondary"}
            mb={4}
            onClick={navigateToItemPage}
          >
            {type === "playlist" ? (
              <i className="fa  fa-list-ul" />
            ) : (
              <i className="fa  fa-play" />
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
          <Text mb={2}>
            {t("components.item_card.owner")}: {user?.email}
          </Text>
        </Column>
      </ItemCardBody>
      {onDelete && (
        <Row justifyContent="flex-start" ml={2} mb={0}>
          <Menu
            menuButton={
              <MenuButton>
                <i className="fa fa-ellipsis-h" />
              </MenuButton>
            }
            transition
            menuClassName="my-menu"
          >
            <MenuItem onClick={() => onDelete()}>Delete</MenuItem>
          </Menu>
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
