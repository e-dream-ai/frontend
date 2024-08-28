import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useSocket from "@/hooks/useSocket";
import { Dream, Frame } from "@/types/dream.types";
import { useTranslation } from "react-i18next";
import {
  ImageContainer,
  OverlayText,
  StyledFrameImage,
} from "./filmstrip-gallery.styled";
import { calculateTimeFromFrames } from "@/utils/dream.util";

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
    <>
      {dream?.filmstrip.map((frame) => (
        <FrameImage key={frame.frameNumber} frame={frame} dream={dream} />
      ))}
    </>
  );
};
