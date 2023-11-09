import { useAddPlaylistItem } from "api/playlist/mutation/useAddPlaylistItem";
import { PLAYLIST_QUERY_KEY } from "api/playlist/query/usePlaylist";
import queryClient from "api/query-client";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { AUTO_CLOSE_MS } from "constants/toast.constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Row, { Column } from "../row/row";
import {
  PlaylistDropzoneIcon,
  StyledPlaylistDropzone,
  StyledPlaylistDropzoneContainer,
} from "./playlist-dropzone.styled";

// const EVENTS = {
//   DRAG_ENTER: "dragenter",
//   DRAG_LEAVE: "dragleave",
//   DROP: "drop",
// };

type PlaylistDropzoneProps = {
  playlistId?: number;
  show?: boolean;
};

export const PlaylistDropzone: React.FC<PlaylistDropzoneProps> = ({
  playlistId,
  show = false,
}) => {
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [isDragEnter, setIsDragEnter] = useState<boolean>(false);
  const { mutate } = useAddPlaylistItem(playlistId);

  const handleAddPlaylistItemMutation = useCallback(
    ({ type, id }: { type?: string; id?: string }) => {
      if (!id) {
        toast.error(t("modal.forgot_password.error_sending_instructions"));
        return;
      }
      const toastId = toast.loading(
        t("components.playlist_dropzone.adding_playlist_item"),
      );

      mutate(
        { type: type as "dream" | "playlist", id: id },
        {
          onSuccess: (data) => {
            if (data.success) {
              queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistId]);
              toast.update(toastId, {
                render: t(
                  "components.playlist_dropzone.playlist_item_successfully_added",
                ),
                type: "success",
                isLoading: false,
                closeButton: true,
                closeOnClick: true,
                autoClose: AUTO_CLOSE_MS,
              });
            } else {
              toast.update(toastId, {
                render: `${t(
                  "components.playlist_dropzone.error_adding_playlist_item",
                )} ${data.message}`,
                type: "error",
                isLoading: false,
                closeButton: true,
                closeOnClick: true,
                autoClose: AUTO_CLOSE_MS,
              });
            }
          },
          onError: () => {
            toast.update(toastId, {
              render: t("modal.forgot_password.error_sending_instructions"),
              type: "error",
              isLoading: false,
              closeButton: true,
              closeOnClick: true,
              autoClose: AUTO_CLOSE_MS,
            });
          },
        },
      );
    },
    [mutate, t, playlistId],
  );

  const handleDragEnter = () => {
    setIsDragEnter(true);
    return false;
  };

  const handleDragLeave = () => {
    setIsDragEnter(false);
    return false;
  };

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event?.preventDefault();
      const dt = event.dataTransfer;
      const type = dt?.getData(DRAG_DROP_FORMAT.TYPE);
      const id = dt?.getData(DRAG_DROP_FORMAT.ID);

      handleAddPlaylistItemMutation({ type, id });
      setIsDragEnter(false);
      return false;
    },
    [handleAddPlaylistItemMutation],
  );

  const registerEvents = useCallback(() => {
    dropzoneRef.current?.addEventListener("dragenter", handleDragEnter);
    dropzoneRef.current?.addEventListener("dragleave", handleDragLeave);
    dropzoneRef.current?.addEventListener("drop", handleDrop);
  }, [handleDrop]);

  const unregisterEvents = useCallback(() => {
    dropzoneRef.current?.removeEventListener("dragenter", handleDragEnter);
    dropzoneRef.current?.removeEventListener("dragleave", handleDragLeave);
    dropzoneRef.current?.removeEventListener("drop", handleDrop);
  }, [dropzoneRef, handleDrop]);

  useEffect(() => {
    registerEvents();
    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  return (
    <StyledPlaylistDropzone
      show={show}
      ref={dropzoneRef}
      isDragEnter={isDragEnter}
    >
      <StyledPlaylistDropzoneContainer>
        <Row>
          <Column alignItems="center">
            <PlaylistDropzoneIcon>+</PlaylistDropzoneIcon>
            <span>
              Drop dream or playlist to add it into the current playlist.
            </span>
          </Column>
        </Row>
      </StyledPlaylistDropzoneContainer>
    </StyledPlaylistDropzone>
  );
};

export const PlaylistDropzoneListener: React.FC<{
  children?: React.ReactNode;
  onChangeDragOver?: (value: boolean) => void;
}> = ({ children, onChangeDragOver }) => {
  const dropzoneListenerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.stopImmediatePropagation();
      onChangeDragOver?.(true);
      return false;
    },
    [onChangeDragOver],
  );

  const handleDragLeave = useCallback(() => {
    onChangeDragOver?.(false);
    return false;
  }, [onChangeDragOver]);

  const registerEvents = useCallback(() => {
    dropzoneListenerRef.current?.addEventListener("dragover", handleDragOver);
    dropzoneListenerRef.current?.addEventListener("dragleave", handleDragLeave);
  }, [handleDragOver, handleDragLeave]);

  const unregisterEvents = useCallback(() => {
    dropzoneListenerRef.current?.removeEventListener(
      "dragover",
      handleDragOver,
    );
    dropzoneListenerRef.current?.removeEventListener(
      "dragleave",
      handleDragLeave,
    );
  }, [dropzoneListenerRef, handleDragOver, handleDragLeave]);

  useEffect(() => {
    registerEvents();
    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  return <div ref={dropzoneListenerRef}>{children}</div>;
};

export default PlaylistDropzone;
