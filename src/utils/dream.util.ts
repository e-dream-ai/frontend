import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { bytesToMegabytes } from "./file.util";
import { framesToSeconds, secondsToTimeFormat } from "./video.utils";
import { getUserName } from "./user.util";
import { FORMAT } from "@/constants/moment.constants";
import moment from "moment";
import { TFunction } from "i18next";
import {
  CCA_LICENSE,
  getCcaLicenceOptions,
  getNsfwOptions,
  NSFW,
} from "@/constants/dream.constants";
import {
  UpdateDreamFormValues,
  UpdateDreamRequestValues,
} from "@/schemas/update-dream.schema";

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

// get nsfw options for filter
export const filterNsfwOption = (value: boolean = false, t: TFunction) =>
  getNsfwOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: NSFW.FALSE, label: t("user.nsfw.sfw") };

// get ccaLicence options for filter
export const filterCcaLicenceOption = (value: boolean = false, t: TFunction) =>
  getCcaLicenceOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: CCA_LICENSE.FALSE, label: t("dream.ccby_license.inactive") };

// format dream obj to fill form
export const formatDreamForm = ({
  dream,
  isAdmin,
  t,
}: {
  dream?: Dream;
  isAdmin: boolean;
  t: TFunction;
}) => ({
  name: dream?.name ?? "",
  description: dream?.description ?? "",
  sourceUrl: dream?.sourceUrl ?? "",
  activityLevel: dream?.activityLevel,
  featureRank: dream?.featureRank,
  processedVideoSize: dream?.processedVideoSize
    ? Math.round(bytesToMegabytes(dream?.processedVideoSize)) + " MB"
    : "-",
  processedVideoFrames: dream?.processedVideoFrames
    ? secondsToTimeFormat(
        framesToSeconds(dream?.processedVideoFrames, dream?.activityLevel),
      )
    : "-",
  processedVideoFPS: dream?.processedVideoFPS
    ? `${dream?.processedVideoFPS} Original FPS`
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
});

export const formatDreamRequest = (
  data: UpdateDreamFormValues,
): UpdateDreamRequestValues => ({
  name: data.name,
  description: data.description,
  sourceUrl: data.sourceUrl,
  activityLevel: data.activityLevel,
  featureRank: data.featureRank,
  displayedOwner: data?.displayedOwner?.value,
  nsfw: data?.nsfw.value === NSFW.TRUE,
  ccbyLicense: data?.ccbyLicense.value === CCA_LICENSE.TRUE,
  startKeyframe: data?.startKeyframe?.value,
  endKeyframe: data?.endKeyframe?.value,
});
