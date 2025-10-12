import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 60px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
`;

const VideoContainer = styled.div<{ isActive: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 1000ms ease;
  opacity: ${(props) => (props.isActive ? 1 : 0)};
  z-index: ${(props) => (props.isActive ? 2 : 1)};

  .video-js {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`;

const PlayerWrapper = styled.div``;

const ButtonContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 16px;
`;

// testing video player
// currently working on crossfade animation using two player instances
const VideoPlayer = () => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const player1Ref = useRef<Player | null>(null);
  const player2Ref = useRef<Player | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  const sources = [
    "https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/da14db51-59b1-4592-85e8-d24c749eabc8/7d42578e-15c7-435f-b0b1-369c8959b54a/7d42578e-15c7-435f-b0b1-369c8959b54a_processed.mp4",
    "https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/da14db51-59b1-4592-85e8-d24c749eabc8/00254001-5889-4f9d-aa1e-fb56da20ba60/00254001-5889-4f9d-aa1e-fb56da20ba60_processed.mp4",
    "https://edream-storage-dreams-staging.s3.us-east-1.amazonaws.com/92e1c95c-031f-46b8-ab7e-b67b52423828/6c8912dd-0f5c-45e3-9284-60a96bf630b7/6c8912dd-0f5c-45e3-9284-60a96bf630b7_processed.mp4",
  ];

  // initialize video players
  useEffect(() => {
    if (!video1Ref.current || !video2Ref.current) return;

    // init player fn, init both players with same config
    const initPlayer = (element: HTMLVideoElement) => {
      const player = videojs(element, {
        controls: true,
        fluid: true,
        preload: "metadata",
      });
      return player;
    };

    player1Ref.current = initPlayer(video1Ref.current);
    player2Ref.current = initPlayer(video2Ref.current);

    // listeners
    player1Ref.current.on("loadstart", () => {
      console.log("video 1 state:", player1Ref.current?.readyState());
    });

    player1Ref.current.on("loadeddata", () => {
      console.log("video 1 loaded and ready to play");
    });

    player2Ref.current.on("loadstart", () => {
      console.log("video 2 state:", player2Ref.current?.readyState());
    });

    player2Ref.current.on("loadeddata", () => {
      console.log("video 2 loaded and ready to play");
    });

    // set initial source for first player
    if (player1Ref.current) {
      player1Ref.current.src({
        src: sources[0],
        type: "video/mp4",
      });
    }

    // cleanup
    return () => {
      if (player1Ref.current) {
        player1Ref.current.dispose();
      }
      if (player2Ref.current) {
        player2Ref.current.dispose();
      }
    };
  }, []);

  const handleCrossfade = async (newIndex: number) => {
    const currentPlayer =
      activePlayer === 1 ? player1Ref.current : player2Ref.current;
    const nextPlayer =
      activePlayer === 1 ? player2Ref.current : player1Ref.current;

    if (!currentPlayer || !nextPlayer) return;

    try {
      const wasPlaying = !currentPlayer.paused();

      // prepare next player
      nextPlayer.src({
        src: sources[newIndex],
        type: "video/mp4",
      });

      // wait for next player to be ready
      await new Promise<void>((resolve) => {
        nextPlayer.one("canplay", () => {
          resolve();
        });
      });

      // play next video if current was playing
      if (wasPlaying) {
        try {
          await nextPlayer.play();
        } catch (error) {
          console.error("Play error:", error);
        }
      }

      // switch active player
      setActivePlayer(activePlayer === 1 ? 2 : 1);
      setCurrentIndex(newIndex);
    } catch (error) {
      console.error("Crossfade error:", error);
    }
  };

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % sources.length;
    handleCrossfade(nextIndex);
  };

  const playPrevious = () => {
    const prevIndex = (currentIndex - 1 + sources.length) % sources.length;
    handleCrossfade(prevIndex);
  };

  const handleVideoClick = (player: Player) => {
    const hasStarted = player.hasStarted_;

    if (!hasStarted || player.paused()) {
      player.play()?.catch((error) => console.error("Play error:", error));
    } else {
      player.pause();
    }
  };

  return (
    <Container>
      <VideoWrapper>
        <VideoContainer isActive={activePlayer === 1}>
          <PlayerWrapper
            data-vjs-player
            onClick={() =>
              player1Ref.current && handleVideoClick(player1Ref.current)
            }
          >
            <video
              ref={video1Ref}
              className="video-js vjs-big-play-centered vjs-fluid"
            />
          </PlayerWrapper>
        </VideoContainer>
        <VideoContainer isActive={activePlayer === 2}>
          <PlayerWrapper
            data-vjs-player
            onClick={() =>
              player2Ref.current && handleVideoClick(player2Ref.current)
            }
          >
            <video
              ref={video2Ref}
              className="video-js vjs-big-play-centered vjs-fluid"
            />
          </PlayerWrapper>
        </VideoContainer>
      </VideoWrapper>
      <ButtonContainer>
        <button onClick={playPrevious}>Prev</button>
        <button onClick={playNext}>Next</button>
      </ButtonContainer>
    </Container>
  );
};

export default VideoPlayer;
