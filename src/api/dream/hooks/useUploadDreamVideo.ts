import { useEffect, useCallback, useReducer } from "react";
import axios from "axios";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast, Id as ToastId } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dream, MultipartUploadRequest } from "@/types/dream.types";
import {
  getFileExtension,
  getFileNameWithoutExtension,
} from "@/utils/file-uploader.util";
import { useCreateMultipartUpload } from "../mutation/useCreateMultipartUpload";
import { useCompleteMultipartUpload } from "../mutation/useCompleteMultipartUpload";
import { useUploadFilePart } from "../mutation/useUploadFilePart";
import { MULTIPART_FILE_PART_SIZE } from "@/constants/modal.constants";
import router from "@/routes/router";
import { ROUTES } from "@/constants/routes.constants";
import { CompletedPart } from "@/schemas/multipart-upload";
import { useAbortMultipartUpload } from "../mutation/useAbortMultipartUpload";
import { useRefreshMultipartUploadUrl } from "../mutation/useRefreshMultipartUploadUrl";
import { UseMutationResult } from "@tanstack/react-query";

type AsyncMutationProps = (params?: {
  file?: File;
  dream?: Dream;
}) => Promise<Dream | undefined>;

type UseUploadDreamVideoProps = {
  navigateToDream?: boolean;
  showUploadProgressToast?: boolean;
};

// Define the state type
type State = {
  dream?: Dream;
  file?: File;
  name?: string;
  extension?: string;
  uploadId?: string;
  isLoading: boolean;
  isFailed: boolean;
  partsProgress: Record<string, number>;
  completedParts: CompletedPart[];
  failedParts: CompletedPart[];
  totalUploadProgress: number;
  /**
   * totalParts value between 1 and 10,000
   */
  totalParts: number;
  toastId?: ToastId;
};

// Define action types
type Action =
  | { type: "SET_DREAM"; payload?: Dream }
  | { type: "SET_FILE"; payload?: File }
  | { type: "SET_NAME"; payload?: string }
  | { type: "SET_EXTENSION"; payload?: string }
  | { type: "SET_UPLOAD_ID"; payload?: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FAILED"; payload: boolean }
  | { type: "SET_PARTS_PROGRESS"; payload: Record<string, number> }
  | { type: "SET_COMPLETED_PARTS"; payload: CompletedPart[] }
  | { type: "ADD_COMPLETED_PART"; payload: CompletedPart }
  | { type: "REMOVE_COMPLETED_PART"; payload: number }
  | { type: "SET_FAILED_PARTS"; payload: CompletedPart[] }
  | { type: "ADD_FAILED_PART"; payload: CompletedPart }
  | { type: "REMOVE_FAILED_PART"; payload: number }
  | { type: "SET_TOTAL_UPLOAD_PROGRESS"; payload: number }
  | { type: "SET_TOTAL_PARTS"; payload: number }
  | { type: "SET_TOAST_ID"; payload?: ToastId }
  | { type: "RESET_STATE" };

const partSize = MULTIPART_FILE_PART_SIZE;

const initialState: State = {
  dream: undefined,
  file: undefined,
  name: undefined,
  extension: undefined,
  uploadId: undefined,
  isLoading: false,
  isFailed: false,
  partsProgress: {},
  completedParts: [],
  failedParts: [],
  totalUploadProgress: 0,
  totalParts: 0,
  toastId: undefined,
};

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_DREAM":
      return { ...state, dream: action.payload };
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_EXTENSION":
      return { ...state, extension: action.payload };
    case "SET_UPLOAD_ID":
      return { ...state, uploadId: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_FAILED":
      return { ...state, isFailed: action.payload };
    case "SET_PARTS_PROGRESS":
      return {
        ...state,
        partsProgress: { ...state.partsProgress, ...action.payload },
      };
    case "SET_COMPLETED_PARTS":
      return { ...state, completedParts: action.payload };
    case "ADD_COMPLETED_PART":
      return {
        ...state,
        completedParts: [...state.completedParts, action.payload],
      };
    case "REMOVE_COMPLETED_PART":
      return {
        ...state,
        completedParts: state.completedParts.filter(
          (part) => part.PartNumber !== action.payload,
        ),
      };
    case "SET_FAILED_PARTS":
      return { ...state, failedParts: action.payload };
    case "ADD_FAILED_PART":
      return { ...state, failedParts: [...state.failedParts, action.payload] };
    case "REMOVE_FAILED_PART":
      return {
        ...state,
        failedParts: state.failedParts.filter(
          (part) => part.PartNumber !== action.payload,
        ),
      };
    case "SET_TOTAL_UPLOAD_PROGRESS":
      return { ...state, totalUploadProgress: action.payload };
    case "SET_TOTAL_PARTS":
      return { ...state, totalParts: action.payload };
    case "SET_TOAST_ID":
      return { ...state, toastId: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
};

const uploadFilePart = async ({
  addCompletedPart,
  addFailedPart,
  mutation,
  partSize,
  partNumber,
  totalParts,
  presignedUrl,
  file,
  skipAddFailedPart = false,
}: {
  addCompletedPart: (completedPart: CompletedPart) => void;
  addFailedPart: (failedPart: CompletedPart) => void;
  mutation: UseMutationResult<string, Error, MultipartUploadRequest>;
  partSize: number;
  partNumber: number;
  totalParts: number;
  presignedUrl: string;
  file: File;
  skipAddFailedPart?: boolean;
}): Promise<CompletedPart | undefined> => {
  const start = (partNumber - 1) * partSize;
  const end = partNumber * partSize;
  const blob = file!.slice(start, end);

  try {
    const etag = await mutation.mutateAsync({
      filePart: blob,
      presignedUrl,
      partNumber,
      totalParts,
    });
    const completedPart = {
      PartNumber: partNumber,
      ETag: etag,
    } as CompletedPart;
    addCompletedPart(completedPart);
    return completedPart;
  } catch (error) {
    if (!skipAddFailedPart) {
      addFailedPart({ PartNumber: partNumber } as CompletedPart);
    }
  }
};

export const useUploadDreamVideo = ({
  navigateToDream = true,
  showUploadProgressToast = true,
}: UseUploadDreamVideoProps = {}) => {
  const { t } = useTranslation();
  const cancelTokenSource = axios.CancelToken.source();

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUploadPartProgress = (partNumber: number, progress: number) => {
    dispatch({
      type: "SET_PARTS_PROGRESS",
      payload: { [partNumber]: progress },
    });
  };

  const addCompletedPart = (completedPart: CompletedPart) =>
    dispatch({ type: "ADD_COMPLETED_PART", payload: completedPart });

  const addFailedPart = (failedPart: CompletedPart) =>
    dispatch({ type: "ADD_FAILED_PART", payload: failedPart });

  const removeFailedPart = (partNumber: number) =>
    dispatch({ type: "REMOVE_FAILED_PART", payload: partNumber });

  const createMultipartUploadMutation = useCreateMultipartUpload({
    cancelTokenSource,
  });

  const uploadFilePartMutation = useUploadFilePart({
    onChangeUploadPartProgress: handleUploadPartProgress,
    cancelTokenSource,
  });

  const completeMultipartUploadMutation = useCompleteMultipartUpload({
    cancelTokenSource,
  });

  const refreshMultipartUploadUrlMutation = useRefreshMultipartUploadUrl({
    cancelTokenSource,
  });

  const abortMultipartUploadMutation = useAbortMultipartUpload();

  const isAnyCreateDreamMutationLoading = useGlobalMutationLoading(
    // @ts-expect-error no valid issue
    createMultipartUploadMutation,
    uploadFilePartMutation,
    completeMultipartUploadMutation,
  );

  /**
   * Function to reset states
   */

  const resetStates = (toastId?: ToastId) => {
    if (toastId) {
      toast.done(toastId);
    }
    dispatch({ type: "RESET_STATE" });
  };

  /**
   * Calculates totalUploadProgress value
   */
  const calculateTotalProgress = useCallback(
    (partsProgress: object) => {
      const allProgress = Object.values(partsProgress);
      const totalProgress =
        allProgress.length > 0
          ? allProgress.reduce((acc, cur) => acc + cur, 0) / state.totalParts
          : 0;
      const roundedTotalProgress = Math.round(totalProgress);

      dispatch({
        type: "SET_TOTAL_UPLOAD_PROGRESS",
        payload: roundedTotalProgress,
      });
    },
    [state.totalParts],
  );

  const retryUploadFailedParts = async () => {
    // prepare upload promises to send each part
    dispatch({ type: "SET_LOADING", payload: true });

    let newToastId: ToastId | undefined;

    if (showUploadProgressToast) {
      newToastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
        progress: 0,
      });

      dispatch({ type: "SET_TOAST_ID", payload: newToastId });
    }

    const uploadPromises: Array<Promise<CompletedPart | undefined>> =
      state.failedParts.map(async (failedPart) => {
        try {
          const refreshMultipartResponse =
            await refreshMultipartUploadUrlMutation.mutateAsync({
              uuid: state.dream?.uuid,
              extension: state.extension,
              part: failedPart.PartNumber!,
              uploadId: state.uploadId,
            });

          const refreshedUrl = refreshMultipartResponse?.data?.url;

          const completedPart = await uploadFilePart({
            addCompletedPart,
            addFailedPart,
            mutation: uploadFilePartMutation,
            partNumber: failedPart.PartNumber!,
            partSize,
            totalParts: state.totalParts,
            presignedUrl: refreshedUrl!,
            file: state.file!,
            skipAddFailedPart: true,
          });
          removeFailedPart(failedPart.PartNumber!);

          return completedPart;
        } catch (_) {
          return;
        }
      });

    /**
     * waits all upload promises to finish
     */
    const completedParts = await Promise.all(uploadPromises);
    const filteredCompletedParts = completedParts.filter(
      (part) => part !== undefined,
    ) as CompletedPart[];
    // count completed parts and retried completed task to verify all parts are uploaded
    const completedPartCount =
      (state.completedParts?.length || 0) +
      (filteredCompletedParts?.length || 0);

    if (completedPartCount !== state.totalParts) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_FAILED", payload: true });
      if (newToastId) {
        toast.done(newToastId);
      }
      toast.error(t("page.create.error_uploading_dream"));
      return undefined;
    }

    return completeMultipartUpload({
      dream: state.dream,
      extension: state.extension,
      name: state.name,
      // combine previous completed parts and new completed parts to complete upload
      parts: [...state.completedParts, ...filteredCompletedParts],
      uploadId: state.uploadId,
    });
  };

  const completeMultipartUpload = async ({
    dream,
    name,
    extension,
    parts,
    uploadId,
  }: {
    dream?: Dream;
    name?: string;
    extension?: string;
    parts?: CompletedPart[];
    uploadId?: string;
  }) => {
    // complete multipart upload
    parts = parts?.sort((a, b) => a.PartNumber! - b.PartNumber!);
    await completeMultipartUploadMutation.mutateAsync({
      uuid: dream?.uuid,
      name: name,
      extension: extension,
      parts,
      uploadId: uploadId,
    });

    toast.success(t("page.create.dream_successfully_uploaded"));
    resetStates(state.toastId);
    if (navigateToDream) {
      router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
    }
    return dream;
  };

  /**
   * Executes mutation
   * @param props
   * @param callbacks
   * @returns
   */
  const mutateAsync: AsyncMutationProps = async ({ file, dream } = {}) => {
    if (!file) {
      toast.error(t("page.create.error_uploading_dream"));
    }

    dispatch({ type: "SET_LOADING", payload: true });

    let newToastId: ToastId | undefined;

    if (showUploadProgressToast) {
      newToastId = toast(t("hooks.use_create_dream.upload_in_progress"), {
        progress: 0,
      });

      dispatch({ type: "SET_TOAST_ID", payload: newToastId });
    }

    const extension = getFileExtension(file);
    const name = getFileNameWithoutExtension(file);
    // calculate number of parts, set 1 as min
    const totalNumberOfParts = Math.max(Math.ceil(file!.size / partSize), 1);
    dispatch({ type: "SET_TOTAL_PARTS", payload: totalNumberOfParts });

    try {
      const { data: multipartUpload } =
        await createMultipartUploadMutation.mutateAsync({
          name,
          extension,
          parts: totalNumberOfParts,
          // If the mutation doesn't receive a dream, it'll be created on the server
          uuid: dream?.uuid,
        });

      if (!dream) {
        dream = multipartUpload?.dream;
      }

      const urls = multipartUpload?.urls ?? [];
      const uploadId = multipartUpload?.uploadId;

      dispatch({
        type: "SET_DREAM",
        payload: dream!,
      });

      dispatch({
        type: "SET_FILE",
        payload: file,
      });

      dispatch({
        type: "SET_NAME",
        payload: name,
      });

      dispatch({
        type: "SET_EXTENSION",
        payload: extension,
      });

      dispatch({
        type: "SET_UPLOAD_ID",
        payload: uploadId,
      });

      // prepare upload promises to send each part
      const uploadPromises: Array<Promise<CompletedPart | undefined>> =
        urls.map((presignedUrl, index) =>
          uploadFilePart({
            addCompletedPart,
            addFailedPart,
            mutation: uploadFilePartMutation,
            partNumber: index + 1,
            partSize,
            totalParts: totalNumberOfParts,
            presignedUrl,
            file: file!,
          }),
        );

      /**
       * waits all upload promises to finish
       */
      const completedParts = await Promise.all(uploadPromises);
      const filteredCompletedParts = completedParts.filter(
        (part) => part !== undefined,
      ) as CompletedPart[];
      const completedPartCount = filteredCompletedParts?.length ?? 0;

      /**
       * missing upload parts
       */
      if (completedPartCount !== totalNumberOfParts) {
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_FAILED", payload: true });
        if (newToastId) {
          toast.done(newToastId);
        }
        toast.error(t("page.create.error_uploading_dream"));
        return undefined;
      }

      return completeMultipartUpload({
        dream,
        extension,
        name,
        parts: filteredCompletedParts,
        uploadId,
      });
    } catch (error) {
      resetStates(newToastId);
      return undefined;
    }
  };

  /**
   * Function to clean the mutation internal state (i.e., it resets the mutation to its initial state).
   */
  const reset = async () => {
    cancelTokenSource.cancel(t("hooks.use_upload_dream_video.upload_canceled"));
    await abortMultipartUploadMutation.mutateAsync({
      extension: state.extension,
      uploadId: state.uploadId,
      uuid: state.dream?.uuid,
    });
    resetStates(state.toastId);
    createMultipartUploadMutation.reset();
    uploadFilePartMutation.reset();
    completeMultipartUploadMutation.reset();
  };

  /**
   * update toast with totalUploadProgress
   */
  useEffect(() => {
    if (state.toastId) {
      const progress = (state.totalUploadProgress / 100).toFixed(2);
      toast.update(state.toastId, {
        progress,
        isLoading: true,
      });
    }
  }, [state.totalUploadProgress, state.toastId]);

  useEffect(() => {
    calculateTotalProgress(state.partsProgress);
  }, [state.partsProgress, calculateTotalProgress]);

  return {
    isLoading: isAnyCreateDreamMutationLoading || state.isLoading,
    isFailed: state.isFailed,
    isAborting: abortMultipartUploadMutation.isLoading,
    uploadProgress: state.totalUploadProgress,
    mutateAsync,
    reset,
    retryUploadFailedParts,
  };
};
