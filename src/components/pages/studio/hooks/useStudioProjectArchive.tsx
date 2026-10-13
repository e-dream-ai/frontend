import { useCallback } from "react";
import { toast } from "react-toastify";
import Bugsnag from "@bugsnag/js";
import { useArchiveEditorProject } from "@/api/editor-project/mutation/useArchiveEditorProject";
import { ArchiveUndoToast } from "../components/archive-undo-toast";

const notifyFailure = (error: Error, { archived }: { archived: boolean }) => {
  Bugsnag.notify(error);
  toast.error(
    archived
      ? "Could not archive this playlist. Try again."
      : "Could not unarchive this playlist. Try again.",
  );
};

export const useStudioProjectArchive = () => {
  const { mutate } = useArchiveEditorProject({ onError: notifyFailure });

  const unarchive = useCallback(
    (uuid: string) => mutate({ uuid, archived: false }),
    [mutate],
  );

  const archive = useCallback(
    (uuid: string, name: string) => {
      mutate({ uuid, archived: true });
      const toastId = toast(
        <ArchiveUndoToast
          name={name}
          onUndo={() => {
            toast.dismiss(toastId);
            unarchive(uuid);
          }}
        />,
      );
    },
    [mutate, unarchive],
  );

  return { archive, unarchive };
};
