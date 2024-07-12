import { Button, Column, Row } from "@/components/shared";
import { FileState } from "@/constants/file.constants";
import { faFileVideo, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Text from "../text/text";

type VideoListProps = {
  videos: FileState[];
  isUploadingVideos: boolean;
  handleDeleteVideo: (index: number) => () => void;
};

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  isUploadingVideos,
  handleDeleteVideo,
}) => {
  return (
    <>
      {videos.map((v, i) => (
        <Row key={i} alignItems="center">
          <Column mr="1rem">
            <FontAwesomeIcon icon={faFileVideo} />
          </Column>
          <Text>{v.name}</Text>
          {!isUploadingVideos && (
            <Button
              type="button"
              buttonType="danger"
              transparent
              ml="2rem"
              onClick={handleDeleteVideo(i)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </Row>
      ))}
    </>
  );
};
