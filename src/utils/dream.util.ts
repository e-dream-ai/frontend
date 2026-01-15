import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { formatFileSize } from "./file.util";
import { formatEta, framesToSeconds, secondsToTimeFormat } from "./video.utils";
import { getUserName } from "./user.util";
import { FORMAT } from "@/constants/moment.constants";
import moment from "moment";
import { TFunction } from "i18next";
import { CCA_LICENSE, HIDDEN, NSFW } from "@/constants/select.constants";
import {
  UpdateDreamFormValues,
  UpdateDreamRequestValues,
} from "@/schemas/update-dream.schema";
import {
  filterCcaLicenceOption,
  filterHiddenOption,
  filterNsfwOption,
} from "./select.util";

export const getDreamNameOrUUID = (dream?: Dream) => dream?.name || dream?.uuid;

export const generateDreamOptimisticApiResponse = ({
  dream,
}: {
  dream?: Dream;
}): ApiResponse<{ dream?: Dream }> => {
  return { success: true, data: { dream } };
};

export const removePlaylistItemFromDream = ({
  dream,
  playlistItemId,
}: {
  dream?: Dream;
  playlistItemId?: number;
}): Dream | undefined => {
  if (dream?.playlistItems) {
    dream.playlistItems = dream.playlistItems.filter(
      (pi) => pi.id !== playlistItemId,
    );
  }
  return dream;
};

/**
 * Calculates the time in HH:MM:SS format based on the provided video frames, fps, and frame number.
 *
 * @param {number} videoFrames - The total number of frames in the video.
 * @param {number} FPS - The frames per second of the video.
 * @param {number} frameNumber - The current frame number.
 * @returns {string} - Time in HH:MM:SS format.
 */
export const calculateTimeFromFrames = ({
  frameNumber,
  videoFrames,
  fps,
}: {
  frameNumber?: number;
  videoFrames?: number;
  fps?: number;
}) => {
  if (!frameNumber || !videoFrames || !fps) {
    return "00:00:00";
  }

  // Adjust the frame number by adding 1 to account for zero-based indexing
  const adjustedFrameNumber = frameNumber + 1;

  // Calculate the current time in seconds
  const currentTimeSeconds = adjustedFrameNumber / fps;

  // Convert the current time in seconds to hours, minutes, and seconds
  const hours = Math.floor(currentTimeSeconds / 3600);
  const minutes = Math.floor((currentTimeSeconds % 3600) / 60);
  const seconds = Math.floor(currentTimeSeconds % 60);

  // Format the time as HH:MM:SS
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// format dream obj to fill form
export const formatDreamForm = ({
  dream,
  isAdmin,
  t,
}: {
  dream?: Dream;
  isAdmin: boolean;
  t: TFunction;
}) => {
  let parsedPrompt: Record<string, unknown> | null = null;
  if (dream?.prompt !== null && dream?.prompt !== undefined) {
    try {
      if (typeof dream.prompt === "string") {
        const parsed = JSON.parse(dream.prompt);
        parsedPrompt =
          typeof parsed === "object" && parsed !== null ? parsed : null;
      } else if (typeof dream.prompt === "object") {
        parsedPrompt = dream.prompt as Record<string, unknown>;
      }
    } catch {
      parsedPrompt = null;
    }
  }

  return {
    name: dream?.name ?? "",
    description: dream?.description ?? "",
    prompt: parsedPrompt,
    sourceUrl: dream?.sourceUrl ?? "",
    activityLevel: dream?.activityLevel,
    featureRank: dream?.featureRank,
    processedVideoSize: dream?.processedVideoSize
      ? formatFileSize(dream?.processedVideoSize)
      : "-",
    processedVideoFrames: dream?.processedVideoFrames
      ? secondsToTimeFormat(
          framesToSeconds(dream?.processedVideoFrames, dream?.activityLevel),
        )
      : "-",
    render_duration: dream?.render_duration
      ? formatEta(Math.floor(dream.render_duration / 1000))
      : "-",
    processedVideoFPS: dream?.processedVideoFPS
      ? `${dream?.processedVideoFPS} Original FPS`
      : "-",
    processedMediaResolution:
      dream?.processedMediaWidth && dream?.processedMediaHeight
        ? `${dream.processedMediaWidth}x${dream.processedMediaHeight}`
        : "-",
    user: getUserName(dream?.user),
    /**
     * set displayedOwner
     * for admins always show displayedOwner
     * for normal users show displayedOwner, if doesn't exists, show user
     */
    displayedOwner: isAdmin
      ? {
          value: dream?.displayedOwner?.id,
          label: getUserName(dream?.displayedOwner),
        }
      : {
          value: dream?.displayedOwner?.id ?? dream?.user?.id,
          label: getUserName(dream?.displayedOwner ?? dream?.user),
        },
    nsfw: filterNsfwOption(dream?.nsfw, t),
    hidden: filterHiddenOption(dream?.hidden, t),
    ccbyLicense: filterCcaLicenceOption(dream?.ccbyLicense, t),
    upvotes: dream?.upvotes,
    downvotes: dream?.downvotes,
    /**
     * keyframes
     */
    startKeyframe: {
      label: dream?.startKeyframe?.name ?? "-",
      value: dream?.startKeyframe?.uuid,
    },
    endKeyframe: {
      label: dream?.endKeyframe?.name ?? "-",
      value: dream?.endKeyframe?.uuid,
    },
    created_at: moment(dream?.created_at).format(FORMAT),
    processed_at: dream?.processed_at
      ? moment(dream?.processed_at).format(FORMAT)
      : "-",
  };
};

export const formatDreamRequest = (
  data: UpdateDreamFormValues,
  isAdmin: boolean = false,
): UpdateDreamRequestValues => {
  let promptString: string | undefined;
  if (data.prompt !== null && data.prompt !== undefined) {
    try {
      promptString = JSON.stringify(data.prompt);
    } catch {
      promptString = undefined;
    }
  }

  return {
    name: data.name,
    description: data.description,
    prompt: promptString,
    sourceUrl: data.sourceUrl,
    activityLevel: data.activityLevel,
    featureRank: data.featureRank,
    displayedOwner: data?.displayedOwner?.value,
    nsfw: data?.nsfw.value === NSFW.TRUE,
    ccbyLicense: data?.ccbyLicense.value === CCA_LICENSE.TRUE,
    startKeyframe: data?.startKeyframe?.value,
    endKeyframe: data?.endKeyframe?.value,

    // If user is admin, add allowed extra fields
    ...(isAdmin
      ? {
          hidden: data?.hidden.value === HIDDEN.TRUE,
        }
      : {}),
  };
};
