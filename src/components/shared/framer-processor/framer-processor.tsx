import { useVideoJs } from "@/hooks/useVideoJS";
import { useEffect, useRef, useState } from "react";
import { Row, Column, Text, Button } from "@/components/shared";
import { VIDEOJS_EVENTS } from "@/constants/video-js.constants";

export const FrameProcessor = () => {
  const {
    startFrameReading,
    stopFrameReading,
    addEventListener,
    activePlayer,
    players,
  } = useVideoJs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [frameInfo, setFrameInfo] = useState({
    count: 0,
    timestamp: 0,
    fps: 0,
  });

  const lastTimestampRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Check if video is playing on mount and when active player changes
  useEffect(() => {
    const activePlayerInstance = players.find((p) => p.id === activePlayer);
    const isPlaying = activePlayerInstance?.player
      ? !activePlayerInstance.player.paused()
      : false;

    setIsReading(isPlaying);
  }, [activePlayer, players]);

  // Listen to video play/pause events
  useEffect(() => {
    const offPlay = addEventListener(VIDEOJS_EVENTS.PLAY, () => {
      setIsReading(true);
    });

    const offEnded = addEventListener(VIDEOJS_EVENTS.ENDED, () => {
      setIsReading(false);
    });

    return () => {
      offPlay();
      offEnded();
    };
  }, [addEventListener]);

  useEffect(() => {
    if (isReading) {
      frameCountRef.current = 0;
      lastTimestampRef.current = 0;

      startFrameReading((frame, metadata) => {
        frameCountRef.current++;

        const timeDiff = metadata.mediaTime - lastTimestampRef.current;
        const fps = timeDiff > 0 ? 1 / timeDiff : 0;
        lastTimestampRef.current = metadata.mediaTime;

        setFrameInfo({
          count: frameCountRef.current,
          timestamp: metadata.mediaTime,
          fps: Math.round(fps),
        });

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            canvasRef.current.width = metadata.width;
            canvasRef.current.height = metadata.height;
            ctx.drawImage(frame, 0, 0);
          }
        }
      });
    } else {
      stopFrameReading();
    }

    return () => {
      stopFrameReading();
    };
  }, [isReading, startFrameReading, stopFrameReading]);

  return (
    <Column style={{ marginTop: "1rem" }}>
      <Row justifyContent="space-between" alignItems="center">
        <Text fontSize="1rem" fontWeight={600}>
          Frame Reader
        </Text>
        <Button
          type="button"
          onClick={() => setIsReading(!isReading)}
          buttonType={isReading ? "danger" : "primary"}
        >
          {isReading ? "Stop Reading" : "Start Reading"}
        </Button>
      </Row>

      {isReading && (
        <Column>
          <Text>Frames: {frameInfo.count}</Text>
          <Text>Timestamp: {frameInfo.timestamp.toFixed(3)}s</Text>
          <Text>FPS: {frameInfo.fps}</Text>
        </Column>
      )}

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          maxWidth: "640px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#000",
        }}
      />
    </Column>
  );
};
