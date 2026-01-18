import { yupResolver } from "@hookform/resolvers/yup";
import { useDeleteDream } from "@/api/dream/mutation/useDeleteDream";
import { useUpdateDream } from "@/api/dream/mutation/useUpdateDream";
import { useUpdateThumbnailDream } from "@/api/dream/mutation/useUpdateThumbnailDream";
import { DREAM_QUERY_KEY, useDream } from "@/api/dream/query/useDream";
import queryClient from "@/api/query-client";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { Button, ItemCard, ItemCardList, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import Restricted from "@/components/shared/restricted/restricted";
import { Column } from "@/components/shared/row/row";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import { ROUTES } from "@/constants/routes.constants";
import { ROLES } from "@/constants/role.constants";
import useAuth from "@/hooks/useAuth";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import router from "@/routes/router";
import UpdateDreamSchema, {
  UpdateDreamFormValues,
} from "@/schemas/update-dream.schema";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import {
  DreamVideoInput,
  DreamImageInput,
  ViewDreamInputs,
} from "./view-dream-inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faExclamationCircle,
  faEye,
  faFlag,
  faGears,
  faPencil,
  faPlay,
  faSave,
  faThumbsDown,
  faThumbsUp,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { DreamStatusType, DreamMediaType } from "@/types/dream.types";
import {
  Video,
  ErrorTextAreaGroup,
  ErrorTextAreaRow,
  ErrorTextAreaBefore,
  ErrorTextArea,
} from "./view-dream.styled";
import { isAdmin } from "@/utils/user.util";
import { useUploadDreamVideo } from "@/api/dream/hooks/useUploadDreamVideo";
import useSocket from "@/hooks/useSocket";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import {
  JOB_PROGRESS_EVENT,
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";
import { emitPlayDream } from "@/utils/socket.util";
import { truncateString } from "@/utils/string.util";
import { AnchorLink } from "@/components/shared";
import { useProcessDream } from "@/api/dream/mutation/useProcessDream";
import { useCancelDream } from "@/api/dream/mutation/useCancelDream";
import { useGetDreamPreview } from "@/api/dream/mutation/useGetDreamPreview";
import { User } from "@/types/auth.types";
import { useUpvoteDream } from "@/api/dream/mutation/useUpvoteDream";
import { useDownvoteDream } from "@/api/dream/mutation/useDownvoteDream";
import { useUnvoteDream } from "@/api/dream/mutation/useUnvoteDream";
import { useDreamVote } from "@/api/dream/query/useDreamVote";
import { VoteType } from "@/types/vote.types";
import { FilmstripGallery } from "@/components/shared/filmstrip-gallery/filmstrip-gallery";
import { PlaylistCheckboxMenu } from "@/components/shared/playlist-checkbox-menu/playlist-checkbox-menu";
import { NotFound } from "@/components/shared/not-found/not-found";
import { formatDreamForm, formatDreamRequest } from "@/utils/dream.util";
import { ReportDreamModal } from "@/components/modals/report-dream.modal";
import { useUpdateReport } from "@/api/report/mutation/useUpdateReport";
import { Tooltip } from "react-tooltip";
import { JobProgressData } from "./view-dream-inputs";
import {
  TOAST_DEFAULT_CONFIG,
  TOOLTIP_DELAY_MS,
} from "@/constants/toast.constants";
import { useDeletePlaylistItem } from "@/api/playlist/mutation/useDeletePlaylistItem";
import { PLAYLIST_PERMISSIONS } from "@/constants/permissions.constants";
import PermissionContext from "@/context/permission.context";
import { Dream } from "@/types/dream.types";
import { ApiResponse } from "@/types/api.types";
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { formatEta } from "@/utils/video.utils";
import Text from "@/components/shared/text/text";

type Params = { uuid: string };

const SectionID = "dream";

const FALLBACK_ERROR_MESSAGE = "An error occurred while processing this dream.";

const formatDreamError = (error?: string | null): string => {
  if (!error) {
    return "";
  }

  const trimmedError = error.trim();
  if (!trimmedError) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmedError);
    if (typeof parsed === "object" && parsed !== null) {
      const parts: string[] = [];

      if (typeof parsed.error_message === "string") {
        const message = parsed.error_message.trim();
        if (message) {
          parts.push(message);
        }
      }

      if (typeof parsed.error === "string") {
        const message = parsed.error.trim();
        if (message && !parts.length) {
          parts.push(message);
        }
      }

      if (typeof parsed.message === "string") {
        const message = parsed.message.trim();
        if (message && !parts.length) {
          parts.push(message);
        }
      }

      if (typeof parsed.error_traceback === "string") {
        const trace = parsed.error_traceback.trim();
        if (trace) {
          parts.push(trace);
        }
      } else if (typeof parsed.stack === "string") {
        const stack = parsed.stack.trim();
        if (stack) {
          parts.push(stack);
        }
      }

      if (parts.length) {
        return parts.join("\n\n");
      }

      return JSON.stringify(parsed, null, 2);
    }
  } catch {}

  return trimmedError;
};

const updateToast = (
  toastId: React.ReactText,
  type: "success" | "error",
  message: string,
) => {
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    ...TOAST_DEFAULT_CONFIG,
  });
};

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid } = useParams<Params>();
  const { user } = useAuth();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [video, setVideo] = useState<MultiMediaState>();
  const [originalImage, setOriginalImage] = useState<MultiMediaState>();
  const [thumbnail, setTumbnail] = useState<MultiMediaState>();
  const [isVideoRemoved, setIsVideoRemoved] = useState<boolean>(false);
  const [isOriginalImageRemoved, setIsOriginalImageRemoved] =
    useState<boolean>(false);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState<boolean>(false);

  const [showConfirmProcessModal, setShowConfirmProcessModal] =
    useState<boolean>(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] =
    useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showProcessDreamReportModal, setShowProcessDreamReportModal] =
    useState<boolean>(false);
  const [showClientNotConnectedModal, setShowClientNotConnectedModal] =
    useState<boolean>(false);
  const [removingPlaylistItemId, setRemovingPlaylistItemId] = useState<
    number | null
  >(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [jobStatus, setJobStatus] = useState<string | undefined>(undefined);
  const [countdownMs, setCountdownMs] = useState<number | undefined>(undefined);
  const validatePromptRef = useRef<(() => boolean) | null>(null);
  const resetPromptRef = useRef<(() => void) | null>(null);

  const upvoteMutation = useUpvoteDream(uuid);
  const downvoteMutation = useDownvoteDream(uuid);
  const unvoteMutation = useUnvoteDream(uuid);

  const {
    data,
    isLoading: isDreamLoading,
    refetch,
    isError,
  } = useDream(uuid, {
    activeRefetchInterval: false,
  });

  const { data: voteData, refetch: refetchVote } = useDreamVote(uuid, {
    activeRefetchInterval: false,
  });

  const { socket } = useSocket();

  const handleJobProgress = useCallback(
    async (data?: JobProgressData) => {
      if (data && data.dream_uuid === uuid) {
        if (data.progress !== undefined) {
          setProgress(Number(data.progress));
        }
        if (typeof data.status === "string") {
          setJobStatus(data.status);
        }
        if (typeof data.countdown_ms === "number") {
          setCountdownMs(data.countdown_ms);
        }
      }
    },
    [uuid],
  );

  useSocketEventListener<JobProgressData>(
    JOB_PROGRESS_EVENT,
    handleJobProgress,
  );

  useEffect(() => {
    setProgress(undefined);
    setJobStatus(undefined);
    setCountdownMs(undefined);
  }, [uuid]);

  useEffect(() => {
    if (!socket || !uuid) return;

    const joinRoom = () => {
      socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
      if (socket && uuid) {
        socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
      }
    };
  }, [uuid, socket]);

  const dream = useMemo(() => data?.data?.dream, [data]);
  const vote = useMemo(() => voteData?.data?.vote, [voteData]);
  const isImageDream = useMemo(
    () => dream?.mediaType === DreamMediaType.IMAGE,
    [dream],
  );
  const playlistItems = useMemo(() => dream?.playlistItems, [dream]);
  const reports = useMemo(() => dream?.reports ?? [], [dream]);
  const isDreamReported = useMemo(
    () => Boolean(dream?.reports?.length),
    [dream],
  );
  const formattedDreamError = useMemo(
    () => formatDreamError(dream?.error),
    [dream?.error],
  );

  useEffect(() => {
    if (dream?.status === DreamStatusType.PROCESSED && !editMode) {
      setTumbnail(undefined);
    }
  }, [dream?.status, editMode]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (
      dream &&
      dream.status !== DreamStatusType.PROCESSED &&
      dream.status !== DreamStatusType.FAILED
    ) {
      intervalId = setInterval(() => {
        refetch();
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dream, refetch]);

  const { mutate: mutateDream, isLoading: isLoadingDreamMutation } =
    useUpdateDream(uuid);
  const processDreamMutation = useProcessDream(uuid);
  const cancelDreamMutation = useCancelDream(uuid);
  const getDreamPreviewMutation = useGetDreamPreview(uuid);
  const uploadDreamVideoMutation = useUploadDreamVideo({
    navigateToDream: false,
  });
  const { mutate: mutateDeletePlaylistItem } = useDeletePlaylistItem();
  const {
    mutate: mutateThumbnailDream,
    isLoading: isLoadingThumbnailDreamMutation,
  } = useUpdateThumbnailDream(uuid);
  const { mutate: mutateDeleteDream, isLoading: isLoadingDeleteDreamMutation } =
    useDeleteDream(uuid);

  const { isAllowedTo } = useContext(PermissionContext);

  const isLoading =
    isLoadingDreamMutation ||
    uploadDreamVideoMutation.isLoading ||
    isLoadingThumbnailDreamMutation;

  const {
    mutateAsync: processReportMutateAsync,
    isLoading: isProcessingReport,
  } = useUpdateReport();

  const formMethods = useForm<UpdateDreamFormValues>({
    resolver: yupResolver(UpdateDreamSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const isDreamProcessing: boolean = useMemo(
    () =>
      (dream?.status === DreamStatusType.QUEUE ||
        dream?.status === DreamStatusType.PROCESSING) &&
      jobStatus?.toUpperCase() !== "COMPLETED",
    [dream, jobStatus],
  );

  const isDreamProcessingRaw: boolean = useMemo(
    () =>
      dream?.status === DreamStatusType.QUEUE ||
      dream?.status === DreamStatusType.PROCESSING,
    [dream],
  );

  const isDreamFailed: boolean = useMemo(
    () => dream?.status === DreamStatusType.FAILED,
    [dream],
  );

  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);

  const isOwner: boolean = useMemo(
    () => (user?.id ? user?.id === dream?.user?.id : false),
    [dream, user],
  );

  const isCreator = useMemo(
    () => user?.role?.name === ROLES.CREATOR_GROUP,
    [user],
  );

  const hasPrompt = useMemo(() => Boolean(dream?.prompt), [dream]);

  const dreamAlgorithm = useMemo(() => {
    if (!dream?.prompt) return null;
    try {
      const parsed =
        typeof dream.prompt === "string"
          ? JSON.parse(dream.prompt)
          : dream.prompt;
      return parsed?.infinidream_algorithm ?? null;
    } catch {
      return null;
    }
  }, [dream?.prompt]);

  const isCancellableAlgorithm = useMemo(() => {
    const cancellableAlgorithms = ["animatediff", "deforum", "uprez"];
    return cancellableAlgorithms.includes(dreamAlgorithm);
  }, [dreamAlgorithm]);

  const showRerunButton = useMemo(
    () => (isUserAdmin && hasPrompt) || (isOwner && isCreator && hasPrompt),
    [isUserAdmin, isOwner, isCreator, hasPrompt],
  );

  const showEditButton = !editMode;
  const showSaveAndCancelButtons = editMode && !isDreamProcessingRaw;
  // Handlers
  const handleMutateVideoDream = async (data: UpdateDreamFormValues) => {
    if (isImageDream) {
      if (isOriginalImageRemoved || originalImage?.file) {
        try {
          await uploadDreamVideoMutation.mutateAsync({
            file: originalImage?.file,
            dream,
          });
          handleMutateThumbnailDream(data);
        } catch (error) {
          toast.error(t("page.view_dream.error_updating_dream"));
        }
      } else {
        handleMutateThumbnailDream(data);
      }
      return;
    }

    if (isVideoRemoved || video?.file) {
      try {
        await uploadDreamVideoMutation.mutateAsync({
          file: video?.file,
          dream,
        });
        handleMutateThumbnailDream(data);
      } catch (error) {
        toast.error(t("page.view_dream.error_updating_dream"));
      }
    } else {
      handleMutateThumbnailDream(data);
    }
  };

  const handleMutateThumbnailDream = (data: UpdateDreamFormValues) => {
    if (isThumbnailRemoved || thumbnail?.file) {
      mutateThumbnailDream(
        { file: thumbnail?.file as Blob },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleMutateDream(data);
            } else {
              toast.error(
                `${t("page.view_dream.error_updating_dream")} ${
                  response.message
                }`,
              );
            }
          },
          onError: () => {
            toast.error(t("page.view_dream.error_updating_dream"));
          },
        },
      );
    } else {
      handleMutateDream(data);
    }
  };

  const handleMutateDream = (data: UpdateDreamFormValues) => {
    mutateDream(formatDreamRequest(data, isUserAdmin), {
      onSuccess: (data) => {
        const dream = data?.data?.dream;
        if (data.success) {
          queryClient.setQueryData([DREAM_QUERY_KEY, dream?.uuid], data);
          toast.success(t("page.view_dream.dream_updated_successfully"));
          setEditMode(false);
        } else {
          toast.error(
            `${t("page.view_dream.error_updating_dream")} ${data.message}`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_dream.error_updating_dream"));
      },
    });
  };

  const handleRemoveDreamFromPlaylist = useCallback(
    (playlistItemId: number, playlistUUID?: string) =>
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!playlistUUID || removingPlaylistItemId === playlistItemId) return;

        const toastId = toast.loading(
          t("page.view_dream.removing_dream_from_playlist"),
        );
        setRemovingPlaylistItemId(playlistItemId);
        mutateDeletePlaylistItem(
          { playlistUUID, itemId: playlistItemId },
          {
            onSuccess: (response) => {
              if (!response.success) {
                const message =
                  response.message ??
                  t("page.view_dream.error_removing_dream_from_playlist");
                updateToast(toastId, "error", message);
                return;
              }
              queryClient.setQueryData<ApiResponse<{ dream: Dream }>>(
                [DREAM_QUERY_KEY, uuid],
                (oldData) => {
                  if (!oldData?.data?.dream) return oldData;
                  const newPlaylistItems =
                    oldData.data.dream.playlistItems?.filter(
                      (item) => item.id !== playlistItemId,
                    ) ?? [];
                  return {
                    ...oldData,
                    data: {
                      ...oldData.data,
                      dream: {
                        ...oldData.data.dream,
                        playlistItems: newPlaylistItems,
                      },
                    },
                  };
                },
              );
              updateToast(
                toastId,
                "success",
                t("page.view_dream.dream_removed_from_playlist"),
              );
            },
            onError: () =>
              updateToast(
                toastId,
                "error",
                t("page.view_dream.error_removing_dream_from_playlist"),
              ),
            onSettled: () =>
              setRemovingPlaylistItemId((currentId) =>
                currentId === playlistItemId ? null : currentId,
              ),
          },
        );
      },
    [mutateDeletePlaylistItem, removingPlaylistItemId, t, uuid],
  );

  const onSubmit = (data: UpdateDreamFormValues) => {
    if (validatePromptRef.current) {
      const isValid = validatePromptRef.current();
      if (!isValid) {
        return;
      }
    }
    handleMutateVideoDream(data);
  };

  const onError = (errors: unknown) => {
    console.error("Form validation errors:", errors);
    toast.error(t("page.view_dream.error_validating_form"));
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    setEditMode(true);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    resetRemoteDreamForm();
    if (resetPromptRef.current) {
      resetPromptRef.current();
    }
    setIsVideoRemoved(false);
    setIsOriginalImageRemoved(false);
    setIsThumbnailRemoved(false);
    setVideo(undefined);
    setOriginalImage(undefined);
    setTumbnail(undefined);
    setEditMode(false);
  };

  const handleGetPreview = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      const response = await getDreamPreviewMutation.mutateAsync();
      if (response?.success && response.data?.preview_frame) {
        let previewUrl = response.data.preview_frame;
        if (!previewUrl.startsWith("data:image")) {
          previewUrl = `data:image/jpeg;base64,${previewUrl}`;
        }
        setTumbnail({ url: previewUrl });
      } else {
        if (jobStatus === "IN_QUEUE") {
          toast.error(t("page.view_dream.rendering_hasnt_started_yet"));
        } else {
          toast.error(t("page.view_dream.error_fetching_preview"));
        }
      }
    } catch (err) {
      if (jobStatus === "IN_QUEUE") {
        toast.error(t("page.view_dream.rendering_hasnt_started_yet"));
      } else {
        toast.error(t("page.view_dream.error_fetching_preview"));
      }
    }
  };

  const onShowConfirmProcessModal = () => setShowConfirmProcessModal(true);
  const onHideConfirmProcessModal = () => setShowConfirmProcessModal(false);
  const onShowConfirmCancelModal = () => setShowConfirmCancelModal(true);
  const onHideConfirmCancelModal = () => setShowConfirmCancelModal(false);
  const onShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmDeleteModal = () => setShowConfirmDeleteModal(false);
  const onShowReportModal = () => setShowReportModal(true);
  const onHideReportModal = () => setShowReportModal(false);
  const onShowProcessDreamReportModal = () =>
    setShowProcessDreamReportModal(true);
  const onHideProcessDreamReportModal = () =>
    setShowProcessDreamReportModal(false);
  const onHideClientNotConnectedModal = () =>
    setShowClientNotConnectedModal(false);

  const handleFlagButton = useCallback(() => {
    // Show process report dream modal when dream is reported and authenticated user is admin
    if (isDreamReported && isUserAdmin) {
      onShowProcessDreamReportModal();
    } else {
      onShowReportModal();
    }
  }, [isDreamReported, isUserAdmin]);

  const resetRemoteDreamForm = useCallback(() => {
    formMethods.reset(formatDreamForm({ dream, isAdmin: isUserAdmin, t }));
  }, [formMethods, dream, isUserAdmin, t]);

  const handleRemoveVideo = () => {
    setIsVideoRemoved(true);
  };

  const handleRemoveOriginalImage = () => {
    setIsOriginalImageRemoved(true);
  };

  const handleRemoveThumbnail = () => {
    setIsThumbnailRemoved(true);
  };

  const handleVideoChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setVideo({ file: files, url: URL.createObjectURL(files) });
    }
    setIsVideoRemoved(false);
  };

  const handleOriginalImageChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setOriginalImage({ file: files, url: URL.createObjectURL(files) });
    }
    setIsOriginalImageRemoved(false);
  };

  const handleThumbnailChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setTumbnail({ file: files, url: URL.createObjectURL(files) });
    }
    setIsThumbnailRemoved(false);
  };

  const onConfirmProcessDream = async () => {
    try {
      const response = await processDreamMutation.mutateAsync();
      if (response?.success) {
        toast.success(`${t("page.view_dream.dream_processing_successfully")}`);
        setTumbnail(undefined);
        setProgress(0);
        setJobStatus(undefined);
        setCountdownMs(undefined);
        refetch();
        onHideConfirmProcessModal();
      } else {
        toast.error(`${t("page.view_dream.error_processing_dream")}`);
      }
    } catch (_) {
      toast.error(`${t("page.view_dream.error_processing_dream")}`);
    }
  };

  const onConfirmCancelDream = async () => {
    try {
      const response = await cancelDreamMutation.mutateAsync();
      if (response?.success) {
        toast.success(`${t("page.view_dream.dream_cancelled_successfully")}`);

        setTumbnail(undefined);
        setProgress(undefined);
        setJobStatus(undefined);
        setCountdownMs(undefined);

        queryClient.setQueryData<ApiResponse<{ dream: Dream }>>(
          [DREAM_QUERY_KEY, uuid],
          (oldData) => {
            if (!oldData?.data?.dream) return oldData;
            const dream = oldData.data.dream;
            const newStatus = dream.video
              ? DreamStatusType.PROCESSED
              : DreamStatusType.NONE;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                dream: {
                  ...dream,
                  status: newStatus,
                },
              },
            };
          },
        );

        refetch();
        onHideConfirmCancelModal();
      } else {
        toast.error(`${t("page.view_dream.error_cancelling_dream")}`);
      }
    } catch (_) {
      toast.error(`${t("page.view_dream.error_cancelling_dream")}`);
    }
  };

  const onConfirmDeleteDream = () => {
    mutateDeleteDream(null, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(`${t("page.view_dream.dream_deleted_successfully")}`);
          onHideConfirmDeleteModal();
          router.navigate(ROUTES.MY_DREAMS);
        } else {
          toast.error(
            `${t("page.view_dream.error_deleting_dream")} ${response.message}`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.view_dream.error_deleting_dream"));
      },
    });
  };

  const handlePlayDream = () => {
    emitPlayDream(socket, dream);
  };

  const handleThumbsUpDream = async () => {
    if (vote?.vote === VoteType.UPVOTE) {
      await unvoteMutation.mutateAsync();
    } else {
      await upvoteMutation.mutateAsync();
    }
    await refetchVote();
  };

  const handleThumbsDownDream = async () => {
    if (vote?.vote === VoteType.DOWNVOTE) {
      await unvoteMutation.mutateAsync();
    } else {
      await downvoteMutation.mutateAsync();
    }
    await refetchVote();
  };

  const onConfirmProcessDreamReport = async () => {
    try {
      const results = await Promise.all(
        reports.map(async (report) => {
          try {
            const data = await processReportMutateAsync({
              uuid: report.uuid,
              values: { processed: true },
            });

            return {
              uuid: report.uuid,
              success: data.success,
              message: data.message,
            };
          } catch (error) {
            return {
              uuid: report.uuid,
              success: false,
              message: "Error processing report",
            };
          }
        }),
      );

      const allSucceeded = results.every((result) => result.success);
      const failedReports = results.filter((result) => !result.success);

      if (allSucceeded) {
        toast.success(t("page.view_dream.reports_processed_successfully"));
        onHideProcessDreamReportModal();
      } else {
        failedReports.forEach((failedReport) => {
          toast.error(
            `${t("page.view_dream.error_processing_report")} ${
              failedReport.uuid
            }: ${failedReport.message}`,
          );
        });
      }

      return results;
    } catch (error) {
      toast.error(t("page.view_dream.error_processing_reports"));
    }
  };

  /**
   * Setting api values to form
   */
  useEffect(() => {
    resetRemoteDreamForm();
  }, [resetRemoteDreamForm]);

  if (!uuid) return <Navigate to={ROUTES.ROOT} replace />;

  /**
   * Return error if query has an error
   */
  if (isError) return <NotFound />;

  if (isDreamLoading || !dream)
    return (
      <Container>
        <Row justifyContent="center">
          <Spinner />
        </Row>
      </Container>
    );

  return (
    <React.Fragment>
      {/**
       * Confirm delete modal
       */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onCancel={onHideConfirmDeleteModal}
        onConfirm={onConfirmDeleteDream}
        isConfirming={isLoadingDeleteDreamMutation}
        title={t("page.view_dream.confirm_delete_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_delete_modal_body")}{" "}
            <em>
              <strong>{truncateString(dream?.name, 30)}</strong>
            </em>
          </Text>
        }
      />

      {/**
       * Confirm rerun process dream modal
       */}
      <ConfirmModal
        isOpen={showConfirmProcessModal}
        onCancel={onHideConfirmProcessModal}
        onConfirm={onConfirmProcessDream}
        isConfirming={processDreamMutation.isLoading}
        title={t("page.view_dream.confirm_process_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_process_modal_body")}{" "}
            <em>
              <strong>{truncateString(dream?.name, 30)}</strong>
            </em>
          </Text>
        }
      />

      {/**
       * Confirm cancel dream modal
       */}
      <ConfirmModal
        isOpen={showConfirmCancelModal}
        onCancel={onHideConfirmCancelModal}
        onConfirm={onConfirmCancelDream}
        isConfirming={cancelDreamMutation.isLoading}
        title={t("page.view_dream.confirm_cancel_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_cancel_modal_body")}{" "}
            <em>
              <strong>{truncateString(dream?.name, 30)}</strong>
            </em>
          </Text>
        }
      />

      {/**
       * Process report dream modal
       */}
      <ConfirmModal
        isOpen={showProcessDreamReportModal}
        onCancel={onHideProcessDreamReportModal}
        onConfirm={onConfirmProcessDreamReport}
        isConfirming={isProcessingReport}
        title={t("page.view_dream.confirm_process_dream_report_modal_title")}
        text={
          <Text>
            {t("page.view_dream.confirm_process_dream_report_modal_body")}{" "}
            <em>
              <strong>{truncateString(dream?.name, 30)}</strong>
            </em>
          </Text>
        }
      />

      {/**
       * Report dream modal
       */}
      <ReportDreamModal
        isOpen={showReportModal}
        onCancel={onHideReportModal}
        dream={dream}
      />

      {/**
       * Client not connected modal
       */}
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
      <Container>
        <Section id={SectionID}>
          <Row
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            pb={[2, 2, "1rem"]}
            separator
          >
            <Column flex={["1 1 200px", "1", "1"]}>
              <h2 style={{ margin: 0, height: "56px" }}>
                {t("page.view_dream.title")}
              </h2>
            </Column>

            <Column flex="1" alignSelf="flex-end" alignItems="flex-end">
              {!editMode && (
                <Row margin={0} alignItems="center">
                  <PlaylistCheckboxMenu type="dream" targetItem={dream} />
                  {!isImageDream && (
                    <>
                      <Button
                        type="button"
                        buttonType="default"
                        transparent
                        style={{ width: "3rem" }}
                        onClick={handlePlayDream}
                        data-tooltip-id="dream-play"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                      </Button>
                      <Tooltip
                        id="dream-play"
                        place="bottom"
                        delayShow={TOOLTIP_DELAY_MS}
                        content={t("page.view_dream.play_dream_tooltip")}
                      />
                    </>
                  )}
                  <Button
                    type="button"
                    buttonType="default"
                    transparent
                    style={{ width: "3rem" }}
                    onClick={handleThumbsUpDream}
                    data-tooltip-id="dream-like"
                  >
                    {vote?.vote === VoteType.UPVOTE ? (
                      <span className="fa-stack fa-sm">
                        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
                        <FontAwesomeIcon
                          icon={faThumbsUp}
                          className="fa-stack-1x"
                          style={{ color: "black" }}
                        />
                      </span>
                    ) : (
                      <FontAwesomeIcon icon={faThumbsUp} />
                    )}
                  </Button>
                  <Tooltip
                    id="dream-like"
                    place="bottom"
                    delayShow={TOOLTIP_DELAY_MS}
                    content={t("actions.like")}
                  />
                  <Button
                    type="button"
                    buttonType="default"
                    transparent
                    style={{ width: "3rem" }}
                    onClick={handleThumbsDownDream}
                    data-tooltip-id="dream-dislike"
                  >
                    {vote?.vote === VoteType.DOWNVOTE ? (
                      <span className="fa-stack fa-sm">
                        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
                        <FontAwesomeIcon
                          icon={faThumbsDown}
                          className="fa-stack-1x"
                          style={{ color: "black" }}
                        />
                      </span>
                    ) : (
                      <FontAwesomeIcon icon={faThumbsDown} />
                    )}
                  </Button>
                  <Tooltip
                    id="dream-dislike"
                    place="bottom"
                    delayShow={TOOLTIP_DELAY_MS}
                    content={t("actions.dislike")}
                  />

                  <Button
                    type="button"
                    buttonType="default"
                    transparent
                    style={{ width: "3rem" }}
                    onClick={handleFlagButton}
                    data-tooltip-id="dream-flag"
                  >
                    {isDreamReported ? (
                      <span className="fa-stack fa-sm">
                        <FontAwesomeIcon icon={faCircle} className="fa-2x" />
                        <FontAwesomeIcon
                          icon={faFlag}
                          className="fa-stack-1x"
                          style={{ color: "black" }}
                        />
                      </span>
                    ) : (
                      <FontAwesomeIcon icon={faFlag} />
                    )}
                  </Button>
                  <Tooltip
                    id="dream-flag"
                    place="bottom"
                    delayShow={TOOLTIP_DELAY_MS}
                    content={t("components.remote_control.report")}
                  />

                  <Restricted
                    to={DREAM_PERMISSIONS.CAN_DELETE_DREAM}
                    isOwner={isOwner}
                  >
                    <Button
                      type="button"
                      buttonType="danger"
                      transparent
                      style={{ width: "3rem" }}
                      onClick={onShowConfirmDeleteModal}
                      data-tooltip-id="dream-delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Tooltip
                      id="dream-delete"
                      place="bottom"
                      delayShow={TOOLTIP_DELAY_MS}
                      content={t("page.view_dream.delete_dream_tooltip")}
                    />
                  </Restricted>
                </Row>
              )}
            </Column>
          </Row>

          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit, onError)}>
              <Row justifyContent="space-between" alignItems="center">
                {isDreamProcessing && (
                  <Column mr={[0, 2, 2]} width="50%">
                    {jobStatus?.toUpperCase() === "IN_PROGRESS" &&
                      typeof progress === "number" && (
                        <>
                          <ProgressBar
                            completed={progress}
                            width="100%"
                            height="16px"
                            labelSize="12px"
                            borderRadius="8px"
                            margin="0 0 0.5rem 0"
                            isLabelVisible={false}
                          />
                          <Text color="textSecondary" fontSize="0.875rem">
                            Rendering {progress.toFixed(1)}% done
                            {countdownMs &&
                              `, ETA ${formatEta(
                                Math.floor(countdownMs / 1000),
                              )}`}
                          </Text>
                        </>
                      )}
                  </Column>
                )}
                <Row flex="1" justifyContent="flex-end">
                  {showEditButton && (
                    <React.Fragment>
                      {showRerunButton &&
                        (isDreamProcessing ? (
                          isCancellableAlgorithm && (
                            <React.Fragment>
                              {dreamAlgorithm !== "animatediff" && (
                                <Button
                                  type="button"
                                  mx="2"
                                  after={<FontAwesomeIcon icon={faEye} />}
                                  isLoading={getDreamPreviewMutation.isLoading}
                                  onClick={handleGetPreview}
                                >
                                  {t("page.view_dream.preview")}{" "}
                                </Button>
                              )}
                              <Button
                                type="button"
                                mx="2"
                                buttonType="danger"
                                after={<FontAwesomeIcon icon={faTimes} />}
                                isLoading={cancelDreamMutation.isLoading}
                                onClick={onShowConfirmCancelModal}
                              >
                                {t("page.view_dream.cancel")}{" "}
                              </Button>
                            </React.Fragment>
                          )
                        ) : (
                          <Button
                            type="button"
                            mx="2"
                            after={<FontAwesomeIcon icon={faGears} />}
                            isLoading={processDreamMutation.isLoading}
                            onClick={onShowConfirmProcessModal}
                          >
                            {t("page.view_dream.rerun")}{" "}
                          </Button>
                        ))}
                      {!isDreamProcessing && (
                        <Restricted
                          to={DREAM_PERMISSIONS.CAN_EDIT_DREAM}
                          isOwner={isOwner}
                        >
                          <Button
                            type="button"
                            after={<FontAwesomeIcon icon={faPencil} />}
                            onClick={handleEdit}
                          >
                            {t("page.view_dream.edit")}{" "}
                          </Button>
                        </Restricted>
                      )}
                    </React.Fragment>
                  )}
                  {showSaveAndCancelButtons && (
                    <React.Fragment>
                      <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        {t("page.view_dream.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        after={<FontAwesomeIcon icon={faSave} />}
                        isLoading={isLoading}
                        ml="1rem"
                      >
                        {isLoading
                          ? t("page.view_dream.saving")
                          : t("page.view_dream.save")}
                      </Button>
                    </React.Fragment>
                  )}
                </Row>
              </Row>

              <ViewDreamInputs
                dream={dream}
                isProcessing={isDreamProcessingRaw}
                editMode={editMode}
                // thumbnail props
                thumbnailState={thumbnail}
                isThumbnailRemoved={isThumbnailRemoved}
                handleThumbnailChange={handleThumbnailChange}
                handleRemoveThumbnail={handleRemoveThumbnail}
                onPromptValidationRequest={(validate) => {
                  validatePromptRef.current = validate;
                }}
                onPromptResetRequest={(reset) => {
                  resetPromptRef.current = reset;
                }}
                jobStatus={jobStatus}
              />

              {!isDreamProcessing ? (
                <React.Fragment>
                  {isDreamFailed ? (
                    <>
                      <Row>
                        <h3>Error</h3>
                      </Row>
                      <Row>
                        <ErrorTextAreaGroup>
                          <ErrorTextAreaRow>
                            <ErrorTextAreaBefore>
                              <FontAwesomeIcon icon={faExclamationCircle} />
                            </ErrorTextAreaBefore>
                            <ErrorTextArea>
                              {formattedDreamError || FALLBACK_ERROR_MESSAGE}
                            </ErrorTextArea>
                          </ErrorTextAreaRow>
                        </ErrorTextAreaGroup>
                      </Row>
                    </>
                  ) : (
                    !isImageDream && (
                      <>
                        <Row>
                          <h3>{t("page.view_dream.filmstrip")}</h3>
                        </Row>
                        <Row flexWrap="wrap">
                          <FilmstripGallery dream={dream} />
                        </Row>

                        <Restricted
                          to={DREAM_PERMISSIONS.CAN_VIEW_ORIGINAL_VIDEO_DREAM}
                          isOwner={isOwner}
                        >
                          <Row
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <h3>{t("page.view_dream.original_video")}</h3>
                            {editMode && (
                              <Button
                                type="button"
                                buttonType="danger"
                                onClick={handleRemoveVideo}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            )}
                          </Row>
                          <Row
                            justifyContent={["center", "center", "flex-start"]}
                          >
                            <DreamVideoInput
                              dream={dream}
                              editMode={editMode}
                              video={video}
                              isRemoved={isVideoRemoved}
                              handleChange={handleVideoChange}
                            />
                          </Row>
                        </Restricted>
                        <Row>
                          <h3>{t("page.view_dream.video")}</h3>
                        </Row>
                        <Row
                          justifyContent={["center", "center", "flex-start"]}
                        >
                          <Video controls src={video?.url || dream?.video} />
                        </Row>
                      </>
                    )
                  )}
                  {!isDreamFailed && isImageDream && (
                    <>
                      <Restricted
                        to={DREAM_PERMISSIONS.CAN_VIEW_ORIGINAL_VIDEO_DREAM}
                        isOwner={isOwner}
                      >
                        <Row justifyContent="space-between" alignItems="center">
                          <h3>{t("page.view_dream.original_image")}</h3>
                          {editMode && (
                            <Button
                              type="button"
                              buttonType="danger"
                              onClick={handleRemoveOriginalImage}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          )}
                        </Row>
                        <Row
                          justifyContent={["center", "center", "flex-start"]}
                        >
                          <DreamImageInput
                            dream={dream}
                            editMode={editMode}
                            image={originalImage}
                            isRemoved={isOriginalImageRemoved}
                            handleChange={handleOriginalImageChange}
                          />
                        </Row>
                      </Restricted>
                      <Row>
                        <h3>{t("page.view_dream.image")}</h3>
                      </Row>
                      <Row justifyContent={["center", "center", "flex-start"]}>
                        <img
                          src={dream?.video || dream?.thumbnail}
                          alt={dream?.name}
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </Row>
                    </>
                  )}
                  <Row>
                    <h3>{t("page.view_dream.playlists")}</h3>
                  </Row>
                  <Row flex="auto">
                    <ItemCardList>
                      {playlistItems?.map((pi) => {
                        const playlistUUID = pi.playlist?.uuid;
                        const playlistOwnerId = pi.playlist?.user?.id;
                        const isPlaylistOwner = Boolean(
                          playlistOwnerId && user?.id === playlistOwnerId,
                        );
                        const canRemoveFromPlaylist =
                          Boolean(playlistUUID) &&
                          isAllowedTo({
                            permission:
                              PLAYLIST_PERMISSIONS.CAN_DELETE_PLAYLIST,
                            isOwner: isPlaylistOwner,
                          });

                        const tooltipId = canRemoveFromPlaylist
                          ? `remove-dream-from-playlist-${pi.id}`
                          : undefined;

                        return (
                          <React.Fragment key={pi.id}>
                            <ItemCard
                              type="playlist"
                              item={pi.playlist}
                              inline
                              size="sm"
                              onDelete={
                                canRemoveFromPlaylist
                                  ? (e: React.MouseEvent) =>
                                      handleRemoveDreamFromPlaylist(
                                        pi.id,
                                        playlistUUID,
                                      )(e)
                                  : undefined
                              }
                              deleteDisabled={
                                !canRemoveFromPlaylist ||
                                removingPlaylistItemId === pi.id
                              }
                              deleteTooltipId={tooltipId}
                            />
                            {tooltipId && (
                              <Tooltip
                                id={tooltipId}
                                place="top"
                                delayShow={TOOLTIP_DELAY_MS}
                                content={t(
                                  "page.view_dream.remove_dream_from_playlist_tooltip",
                                )}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </ItemCardList>
                  </Row>
                </React.Fragment>
              ) : (
                false
              )}
            </form>
          </FormProvider>
        </Section>
      </Container>
    </React.Fragment>
  );
};

export default ViewDreamPage;
