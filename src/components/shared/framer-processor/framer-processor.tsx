import { useVideoJs } from "@/hooks/useVideoJS";
import { useEffect, useRef, useState } from "react";
import { Row, Column, Text, Button } from "@/components/shared";

// framer-processor.tsx
export const FrameProcessor = () => {
  const { startFrameReading, stopFrameReading } = useVideoJs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [frameInfo, setFrameInfo] = useState({
    count: 0,
    timestamp: 0,
    fps: 0,
  });

  const lastTimestampRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

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
