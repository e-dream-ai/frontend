import { useTranslation } from "react-i18next";
import ProgressBar from "../progress-bar/progress-bar";
import Text from "../text/text";

type UploadVideosProgressProps = {
  isUploading: boolean;
  totalUploadedVideos: number;
  totalVideos: number;
  totalUploadedVideosPercentage: number;
  currentUploadFile: number;
  uploadProgress: number;
};

export const UploadVideosProgress: React.FC<UploadVideosProgressProps> = ({
  isUploading,
  totalVideos,
  totalUploadedVideos,
  totalUploadedVideosPercentage,
  currentUploadFile,
  uploadProgress,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {isUploading && (
        <>
          <Text my={3}>
            {t("page.create.playlist_file_count", {
              current: totalUploadedVideos,
              total: totalVideos,
            })}
          </Text>
          <ProgressBar completed={totalUploadedVideosPercentage} />
          <Text my={3}>
            {t("page.create.playlist_uploading_current_file", {
              current: currentUploadFile + 1,
            })}
          </Text>
          <ProgressBar completed={uploadProgress} />
        </>
      )}
    </>
  );
};
