import { useEffect, useCallback, useReducer } from "react";
import axios from "axios";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { toast, Id as ToastId } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Dream,
  MultipartUpload,
  MultipartUploadRequest,
  RefresgMultipartUpload,
} from "@/types/dream.types";
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
import {
  CompleteMultipartUploadFormValues,
  CompletedPart,
  CreateMultipartUploadFormValues,
  RefreshMultipartUploadUrlFormValues,
} from "@/schemas/multipart-upload";
import { useAbortMultipartUpload } from "../mutation/useAbortMultipartUpload";
import { useRefreshMultipartUploadUrl } from "../mutation/useRefreshMultipartUploadUrl";
import { UseMutationResult } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api.types";
import { TFunction } from "i18next";

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

type MultipleUpdatesActionType = "INITIALIZE_UPLOAD" | "UPDATE_UPLOAD";

const initialState: State = {
  dream: undefined,
  file: undefined,
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

/**
 * Calculates the total number of parts a file needs to be divided into for upload
 * @param fileSize The size of the file in bytes.
 * @returns The total number of parts (integer).
 */
const calculateTotalParts = (fileSize: number) => {
  return Math.max(Math.ceil(fileSize / MULTIPART_FILE_PART_SIZE), 1);
};

/**
 * Initiates the multipart upload process by obtaining presigned URLs for uploading each part.
 * @param params Object containing file, dream, totalNumberOfParts, and createMultipartUploadMutation.
 * @returns An object containing updated dream information, upload ID, and presigned URLs for parts.
 */
const initiateUpload = async ({
  file,
  dream,
  totalNumberOfParts,
  createMultipartUploadMutation,
}: {
  file?: File;
  dream?: Dream;
  totalNumberOfParts?: number;
  createMultipartUploadMutation: UseMutationResult<
    ApiResponse<MultipartUpload>,
    Error,
    CreateMultipartUploadFormValues
  >;
}) => {
  const extension = getFileExtension(file);
  const name = getFileNameWithoutExtension(file);
  const { data: multipartUpload } =
    await createMultipartUploadMutation.mutateAsync({
      name,
      extension,
      parts: totalNumberOfParts,
      uuid: dream?.uuid,
    });

  return {
    dream: multipartUpload?.dream || dream,
    uploadId: multipartUpload?.uploadId,
    urls: multipartUpload?.urls || [],
  };
};

/**
 * Attempts to upload a single part of the file to the AWS S3 server using a presigned URL.
 * @param params Object containing details about the file part, presigned URL, and part number.
 * @returns The ETag of the uploaded part if successful; otherwise, `undefined`.
 */
const attemptUploadFilePart = async ({
  mutation,
  filePart,
  presignedUrl,
  totalParts,
  partNumber,
}: {
  mutation: UseMutationResult<string, Error, MultipartUploadRequest>;
  filePart: Blob;
  presignedUrl: string;
  totalParts: number;
  partNumber: number;
}) => {
  try {
    const etag = await mutation.mutateAsync({
      filePart,
      presignedUrl,
      partNumber,
      totalParts,
    });
    return etag;
  } catch (error) {
    console.error(`Error uploading part ${partNumber} `, error);
    return undefined;
  }
};

/**
 * Refreshes the presigned URL for a specific part of the file, in case the previous URL expired or failed.
 * @param params Object containing details about the upload session and part number.
 * @returns A new presigned URL for the part number.
 */
const refreshPresignedUrl = async ({
  uuid,
  uploadId,
  partNumber,
  extension,
  refreshMultipartUploadUrlMutation,
}: {
  uuid?: string;
  uploadId?: string;
  extension?: string;
  partNumber: number;
  refreshMultipartUploadUrlMutation: UseMutationResult<
    ApiResponse<RefresgMultipartUpload>,
    Error,
    RefreshMultipartUploadUrlFormValues
  >;
}) => {
  try {
    const response = await refreshMultipartUploadUrlMutation.mutateAsync({
      uuid,
      extension,
      part: partNumber,
      uploadId,
    });
    return response?.data?.url;
  } catch (error) {
    console.error("Error refreshing presigned URL", error);
    return undefined;
  }
};

/**
 * Manages the upload of a single file part, including retrying with a refreshed URL if necessary.
 * @param params Object containing details about the file part, presigned URL, and part number,including mutation hooks for uploading and refreshing URLs.
 * @returns A promise resolving to the completed part information or `undefined` on failure.
 */
const uploadFilePart = async ({
  uuid,
  uploadId,
  uploadFilePartMutation,
  refreshMultipartUploadUrlMutation,
  partNumber,
  totalParts,
  presignedUrl,
  file,
  extension,
  skipAddFailedPart = false,
  addCompletedPart,
  addFailedPart,
  resetPartProgress,
}: {
  uploadFilePartMutation: UseMutationResult<
    string,
    Error,
    MultipartUploadRequest
  >;
  refreshMultipartUploadUrlMutation: UseMutationResult<
    ApiResponse<RefresgMultipartUpload>,
    Error,
    RefreshMultipartUploadUrlFormValues
  >;
  uuid?: string;
  file: File;
  extension?: string;
  uploadId?: string;
  partNumber: number;
  totalParts: number;
  presignedUrl: string;
  skipAddFailedPart?: boolean;
  addCompletedPart: (completedPart: CompletedPart) => void;
  addFailedPart: (failedPart: CompletedPart) => void;
  resetPartProgress: (partNumber: number) => void;
}): Promise<CompletedPart | undefined> => {
  const start = (partNumber - 1) * MULTIPART_FILE_PART_SIZE;
  const end = partNumber * MULTIPART_FILE_PART_SIZE;
  const blob = file.slice(start, end);
  let currentUrl = presignedUrl;
  let attempts = 0;
  // Configure the maximum number of attempts as needed
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const etag = await attemptUploadFilePart({
      mutation: uploadFilePartMutation,
      filePart: blob,
      presignedUrl: currentUrl,
      partNumber,
      totalParts,
    });

    if (etag) {
      const completedPart = { PartNumber: partNumber, ETag: etag };
      addCompletedPart(completedPart);
      return completedPart; // Successfully uploaded
    } else {
      attempts += 1;
      resetPartProgress(partNumber);
      if (attempts < maxAttempts) {
        const refreshedUrl = await refreshPresignedUrl({
          uuid,
          uploadId,
          partNumber,
          extension,
          refreshMultipartUploadUrlMutation,
        });
        // If refreshing the URL fails, exit the loop
        if (!refreshedUrl) break;
        // Update the URL for the next attempt
        currentUrl = refreshedUrl;
      }
    }
  }

  // If the loop completes without a successful upload, handle as a failed part
  if (!skipAddFailedPart) {
    addFailedPart({ PartNumber: partNumber });
  }

  return undefined;
};

/**
 * Completes the multipart upload process by sending a request with all successfully uploaded parts.
 * @param params Object containing details about the dream, file, parts, and upload ID, including mutation hooks.
 * @returns The updated dream object upon successful completion of the upload.
 */
const completeMultipartUpload = async ({
  t,
  dream,
  name,
  extension,
  toastId,
  parts,
  uploadId,
  navigateToDream,
  completeMultipartUploadMutation,
  resetStates,
}: {
  t: TFunction;
  dream?: Dream;
  name?: string;
  extension?: string;
  toastId?: ToastId;
  parts?: CompletedPart[];
  uploadId?: string;
  navigateToDream: boolean;
  completeMultipartUploadMutation: UseMutationResult<
    ApiResponse<{ dream: Dream }>,
    Error,
    CompleteMultipartUploadFormValues
  >;
  resetStates: (toastId?: ToastId) => void;
}) => {
  if (parts) {
    // Ensure parts are sorted by PartNumber before completing the upload
    parts.sort((a, b) => a.PartNumber! - b.PartNumber!);
  }

  try {
    await completeMultipartUploadMutation.mutateAsync({
      uuid: dream?.uuid,
      name,
      extension,
      parts,
      uploadId,
    });

    toast.success(t("page.create.dream_successfully_uploaded"));
    resetStates(toastId);
    if (navigateToDream && dream?.uuid) {
      // Navigate to the dream view page
      router.navigate(`${ROUTES.VIEW_DREAM}/${dream.uuid}`);
    }
  } catch (error) {
    // Handle potential errors from the mutation or other operations
    console.error("Error completing multipart upload", error);
    toast.error(t("page.create.error_completing_upload"));
  }

  return dream;
};

/**
 * Maps the upload of all file parts based on the provided presigned URLs.
 * @param params Object containing details about the file, total number of parts and mutation hooks.
 * @returns An array of completed part information for successful uploads.
 */
async function uploadParts({
  urls,
  file,
  totalNumberOfParts,
  uploadId,
  dream,
  uploadFilePartMutation,
  refreshMultipartUploadUrlMutation,
  addCompletedPart,
  addFailedPart,
  resetPartProgress,
}: {
  urls: Array<string>;
  file: File;
  totalNumberOfParts: number;
  uploadId?: string;
  dream?: Dream;
  uploadFilePartMutation: UseMutationResult<
    string,
    Error,
    MultipartUploadRequest
  >;
  refreshMultipartUploadUrlMutation: UseMutationResult<
    ApiResponse<RefresgMultipartUpload>,
    Error,
    RefreshMultipartUploadUrlFormValues
  >;
  addCompletedPart: (completedPart: CompletedPart) => void;
  addFailedPart: (failedPart: CompletedPart) => void;
  resetPartProgress: (partNumber: number) => void;
}) {
  const uploadPromises = urls.map(
    async (presignedUrl, index) =>
      await uploadFilePart({
        addCompletedPart,
        addFailedPart,
        uploadFilePartMutation,
        partNumber: index + 1,
        totalParts: totalNumberOfParts,
        presignedUrl,
        file,
        extension: getFileExtension(file),
        refreshMultipartUploadUrlMutation,
        uploadId,
        uuid: dream?.uuid,
        resetPartProgress,
      }),
  );

  const completedParts = await Promise.all(uploadPromises);
  return completedParts.filter(
    (part) => part !== undefined,
  ) as Array<CompletedPart>;
}

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

  const addFailedPart = (failedPart: CompletedPart) => {
    dispatch({ type: "ADD_FAILED_PART", payload: failedPart });
    resetPartProgress(failedPart.PartNumber!);
  };

  const resetPartProgress = (partNumber: number) => {
    dispatch({
      type: "SET_PARTS_PROGRESS",
      payload: { [partNumber]: 0 },
    });
  };

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
   *
   */
  const dispatchMultipleUpdates = ({
    type,
    payload,
  }: {
    type: MultipleUpdatesActionType;
    payload?: {
      dream?: Dream;
      file?: File;
      toastId?: ToastId;
      uploadId?: string;
    };
  }) => {
    const { file, dream, toastId, uploadId } = payload || {};

    switch (type) {
      case "INITIALIZE_UPLOAD":
        dispatch({ type: "SET_LOADING", payload: true });
        break;
      case "UPDATE_UPLOAD":
        if (file) dispatch({ type: "SET_FILE", payload: file });
        if (dream) dispatch({ type: "SET_DREAM", payload: dream });
        if (toastId) dispatch({ type: "SET_TOAST_ID", payload: toastId });
        if (uploadId) dispatch({ type: "SET_UPLOAD_ID", payload: uploadId });
        break;
    }
  };

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

  /**
   * Attempts to re-upload parts of the file that previously failed to upload.
   */
  const retryUploadFailedParts = async () => {
    // If there are no failed parts, no need to proceed
    if (state.failedParts.length === 0) {
      return;
    }

    const newToastId = showUploadProgressToast
      ? toast(t("hooks.use_create_dream.upload_in_progress"), { progress: 0 })
      : undefined;

    dispatchMultipleUpdates({
      type: "INITIALIZE_UPLOAD",
      payload: { toastId: newToastId },
    });

    // Prepare to track failed parts locally to avoid stale state issues
    const localCompletedParts = [];
    let localFailedParts = [...state.failedParts];

    dispatch({ type: "SET_LOADING", payload: true });

    for (const failedPart of localFailedParts) {
      try {
        const extension = getFileExtension(state.file);

        const refreshedUrl = await refreshPresignedUrl({
          uuid: state.dream?.uuid,
          uploadId: state.uploadId,
          partNumber: failedPart.PartNumber!,
          extension: extension,
          refreshMultipartUploadUrlMutation,
        });

        if (!refreshedUrl) {
          throw new Error("Failed to refresh URL");
        }

        const completedPart = await uploadFilePart({
          // Pass necessary parameters, including the refreshed URL
          presignedUrl: refreshedUrl,
          file: state.file!,
          partNumber: failedPart.PartNumber!,
          refreshMultipartUploadUrlMutation,
          totalParts: state.totalParts,
          uploadFilePartMutation,
          extension,
          uploadId: state.uploadId,
          uuid: state.dream?.uuid,
          addCompletedPart,
          addFailedPart,
          resetPartProgress,
          skipAddFailedPart: true,
        });

        // Assuming uploadFilePart returns undefined on failure
        if (!completedPart) {
          throw new Error("Failed to upload part");
        }

        // Successfully uploaded part, update state accordingly
        localCompletedParts.push(completedPart);
        addCompletedPart(completedPart);
        removeFailedPart(completedPart.PartNumber!);

        // Remove successfully retried part from localFailedParts
        localFailedParts = localFailedParts.filter(
          (part) => part.PartNumber !== failedPart.PartNumber,
        );
      } catch (error) {
        console.error(`Retry failed for part ${failedPart.PartNumber}:`, error);
        // Optionally, handle the failure (e.g., by showing a message to the user)
      }
    }

    // Update the failed parts state to reflect any parts that still failed after retry
    dispatch({ type: "SET_FAILED_PARTS", payload: localFailedParts });

    // Final state updates after retry attempts
    if (localFailedParts.length > 0) {
      dispatch({ type: "SET_FAILED", payload: true });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
      toast.success("All parts were successfully uploaded.");

      return await completeMultipartUpload({
        dream: state.dream,
        parts: [...state.completedParts, ...localCompletedParts],
        uploadId: state.uploadId,
        toastId: newToastId,
        completeMultipartUploadMutation,
        navigateToDream,
        t,
        extension: getFileExtension(state.file),
        name: getFileNameWithoutExtension(state.file),
        resetStates,
      });
    }

    if (newToastId) {
      toast.done(newToastId);
    }
  };

  /**
   * Main function to initiate and manage the file upload process.
   * @param props Object containing optional `file` and `dream` details.
   * @returns A promise resolving to the updated dream object on successful upload or `undefined` on failure.
   */
  const mutateAsync: AsyncMutationProps = async ({ file, dream } = {}) => {
    if (!file) {
      toast.error(t("page.create.error_uploading_dream"));
      return undefined;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    const newToastId = showUploadProgressToast
      ? toast(t("hooks.use_create_dream.upload_in_progress"), { progress: 0 })
      : undefined;

    dispatchMultipleUpdates({
      type: "INITIALIZE_UPLOAD",
    });

    try {
      const totalNumberOfParts = calculateTotalParts(file.size);
      dispatch({ type: "SET_TOTAL_PARTS", payload: totalNumberOfParts });

      const {
        dream: updatedDream,
        uploadId,
        urls,
      } = await initiateUpload({
        file,
        dream,
        totalNumberOfParts,
        createMultipartUploadMutation,
      });

      dispatchMultipleUpdates({
        type: "UPDATE_UPLOAD",
        payload: { file, dream: updatedDream, toastId: newToastId, uploadId },
      });

      const completedParts = await uploadParts({
        urls,
        file,
        totalNumberOfParts,
        uploadId,
        dream: updatedDream,
        refreshMultipartUploadUrlMutation,
        uploadFilePartMutation,
        addCompletedPart,
        addFailedPart,
        resetPartProgress,
      });

      if (completedParts.length !== totalNumberOfParts) {
        handleUploadFailure({ toastId: newToastId });
        return undefined;
      }

      const name = getFileNameWithoutExtension(file);
      const extension = getFileExtension(file);

      return await completeMultipartUpload({
        dream: updatedDream,
        parts: completedParts,
        uploadId,
        toastId: newToastId,
        completeMultipartUploadMutation,
        navigateToDream,
        t,
        extension,
        name,
        resetStates,
      });
    } catch (error) {
      handleUploadFailure({ toastId: newToastId, error });
      return undefined;
    }
  };

  /**
   * Handles upload failure by logging the error, updating state to reflect the failure
   * @param params An object containing toastId and error
   */
  const handleUploadFailure = ({
    toastId,
    error,
  }: {
    toastId?: ToastId;
    error?: object | unknown;
  }) => {
    if (error) console.error("Upload error:", error);
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_FAILED", payload: true });
    if (toastId) toast.done(toastId);
    toast.error(t("page.create.error_uploading_dream"));
  };

  /**
   * Resets the internal state and aborts the upload process if needed.
   */
  const reset = async () => {
    cancelTokenSource.cancel(t("hooks.use_upload_dream_video.upload_canceled"));
    const extension = getFileExtension(state.file);
    try {
      await abortMultipartUploadMutation.mutateAsync({
        extension: extension,
        uploadId: state.uploadId,
        uuid: state.dream?.uuid,
      });
    } catch (error) {
      console.error("Error aborting upload.", error);
    }
    resetStates(state.toastId);
    createMultipartUploadMutation.reset();
    uploadFilePartMutation.reset();
    completeMultipartUploadMutation.reset();
  };

  /**
   * Updates toast with totalUploadProgress
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
