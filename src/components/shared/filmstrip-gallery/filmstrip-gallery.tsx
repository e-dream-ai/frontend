import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import Grid from "@/components/shared/grid/grid";
import useSocket from "@/hooks/useSocket";
import { Dream, Frame } from "@/types/dream.types";
import { useTranslation } from "react-i18next";
import {
  ImageContainer,
  OverlayIcon,
  OverlayText,
  StyledFrameImage,
} from "./filmstrip-gallery.styled";
import { calculateTimeFromFrames } from "@/utils/dream.util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const FrameImage: React.FC<{ frame: Frame; dream?: Dream }> = ({
  frame,
  dream,
}) => {
  const { socket } = useSocket();

  const handlePlayDreamAtFrameNumber = () => {
    socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
      event: REMOTE_CONTROLS.PLAY_DREAM.event,
      uuid: dream?.uuid,
      name: dream?.name,
      frameNumber: frame?.frameNumber,
    });
  };

  return (
    <ImageContainer onClick={handlePlayDreamAtFrameNumber}>
      <StyledFrameImage url={frame.url} src="/images/blank.gif" />
      <OverlayText>
        {calculateTimeFromFrames({
          frameNumber: frame.frameNumber,
          videoFrames: dream?.processedVideoFrames,
          fps: dream?.processedVideoFPS,
        })}
      </OverlayText>
      <OverlayIcon className="filmstrip-icon">
        <FontAwesomeIcon icon={faPlay} />
      </OverlayIcon>
    </ImageContainer>
  );
};

type FilmstripProps = {
  dream?: Dream;
};

export const FilmstripGallery: React.FC<FilmstripProps> = ({ dream }) => {
  const { t } = useTranslation();

  if (!dream?.filmstrip?.length) {
    return <>{t("components.filmstrip.empty")}</>;
  }

  return (
    <Grid
      style={{ width: "100%", gap: "1rem" }}
      gridTemplateColumns={["repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]}
    >
      {dream?.filmstrip.map((frame) => (
        <FrameImage key={frame.frameNumber} frame={frame} dream={dream} />
      ))}
    </Grid>
  );
};
