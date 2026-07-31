import React, { useCallback, useEffect, useRef, useState } from "react";
import type { FlowKeyframe } from "@/types/flow.types";
import {
  clampCropRegion,
  defaultCenterCrop,
  type CropRegion,
} from "@/utils/aspect-crop";
import {
  Overlay,
  Panel,
  Header,
  Title,
  CloseBtn,
  Body,
  Frame,
  FrameImg,
  Grid,
  ZoomRow,
  ZoomSlider,
  Hint,
  Footer,
  ResetBtn,
  Actions,
  SecondaryBtn,
  PrimaryBtn,
} from "./keyframe-crop-modal.styled";

interface Props {
  keyframe: FlowKeyframe;
  /** Numeric output ratio (width / height) the crop is locked to. */
  outputRatio: number;
  onSave: (crop: CropRegion) => void;
  onClose: () => void;
}

const MAX_FRAME = 380;
const MAX_ZOOM_MULTIPLE = 4;

/** Frame pixel dimensions for a given output ratio, bounded by MAX_FRAME. */
function frameSize(ratio: number): { w: number; h: number } {
  if (ratio >= 1) return { w: MAX_FRAME, h: Math.round(MAX_FRAME / ratio) };
  return { w: Math.round(MAX_FRAME * ratio), h: MAX_FRAME };
}

export const KeyframeCropModal: React.FC<Props> = ({
  keyframe,
  outputRatio,
  onSave,
  onClose,
}) => {
  const frame = frameSize(outputRatio);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(
    keyframe.naturalWidth && keyframe.naturalHeight
      ? { w: keyframe.naturalWidth, h: keyframe.naturalHeight }
      : null,
  );
  const [scale, setScale] = useState(1); // displayed px per source px
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // image top-left vs frame
  const initialized = useRef(false);

  const coverScale = dims ? Math.max(frame.w / dims.w, frame.h / dims.h) : 1;

  const clampOffset = useCallback(
    (x: number, y: number, s: number, d: { w: number; h: number }) => {
      const dispW = d.w * s;
      const dispH = d.h * s;
      return {
        x: Math.min(0, Math.max(frame.w - dispW, x)),
        y: Math.min(0, Math.max(frame.h - dispH, y)),
      };
    },
    [frame.w, frame.h],
  );

  // Initialize scale/offset from an existing crop (or a fresh center crop) once
  // the source dimensions are known.
  useEffect(() => {
    if (!dims || initialized.current) return;
    initialized.current = true;
    const cover = Math.max(frame.w / dims.w, frame.h / dims.h);
    const crop =
      keyframe.crop ?? defaultCenterCrop(dims.w, dims.h, outputRatio);
    const dispW = frame.w / crop.width;
    const s = Math.max(cover, dispW / dims.w);
    const dispH = dims.h * s;
    const next = clampOffset(-crop.x * (dims.w * s), -crop.y * dispH, s, dims);
    setScale(s);
    setOffset(next);
  }, [dims, keyframe.crop, outputRatio, frame.w, frame.h, clampOffset]);

  // Pointer drag to pan.
  const drag = useRef<{
    px: number;
    py: number;
    ox: number;
    oy: number;
  } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !dims) return;
    const nx = drag.current.ox + (e.clientX - drag.current.px);
    const ny = drag.current.oy + (e.clientY - drag.current.py);
    setOffset(clampOffset(nx, ny, scale, dims));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  // Zoom about the frame center.
  const onZoom = (nextScale: number) => {
    if (!dims) return;
    const cx = (frame.w / 2 - offset.x) / scale;
    const cy = (frame.h / 2 - offset.y) / scale;
    const nx = frame.w / 2 - cx * nextScale;
    const ny = frame.h / 2 - cy * nextScale;
    setScale(nextScale);
    setOffset(clampOffset(nx, ny, nextScale, dims));
  };

  const handleReset = () => {
    if (!dims) return;
    const crop = defaultCenterCrop(dims.w, dims.h, outputRatio);
    const s = coverScale;
    const dispH = dims.h * s;
    setScale(s);
    setOffset(clampOffset(-crop.x * (dims.w * s), -crop.y * dispH, s, dims));
  };

  const handleSave = () => {
    if (!dims) {
      onClose();
      return;
    }
    const dispW = dims.w * scale;
    const dispH = dims.h * scale;
    const crop = clampCropRegion(
      {
        x: -offset.x / dispW,
        y: -offset.y / dispH,
        width: frame.w / dispW,
        height: frame.h / dispH,
      },
      dims.w,
      dims.h,
      outputRatio,
    );
    onSave(crop);
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Crop — {keyframe.name || "frame"}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            &times;
          </CloseBtn>
        </Header>

        <Body>
          <Frame
            $w={frame.w}
            $h={frame.h}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {dims ? (
              <FrameImg
                src={keyframe.imageUrl}
                alt={keyframe.name}
                draggable={false}
                style={{
                  width: dims.w * scale,
                  height: dims.h * scale,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            ) : (
              <FrameImg
                src={keyframe.imageUrl}
                alt={keyframe.name}
                draggable={false}
                onLoad={(e) =>
                  setDims({
                    w: e.currentTarget.naturalWidth,
                    h: e.currentTarget.naturalHeight,
                  })
                }
                style={{ width: frame.w, height: frame.h, objectFit: "cover" }}
              />
            )}
            <Grid />
          </Frame>

          <ZoomRow>
            <span>Zoom</span>
            <ZoomSlider
              type="range"
              min={coverScale}
              max={coverScale * MAX_ZOOM_MULTIPLE}
              step={coverScale / 100}
              value={scale}
              onChange={(e) => onZoom(Number(e.target.value))}
              disabled={!dims}
            />
          </ZoomRow>
          <Hint>Drag to reposition · slide to zoom</Hint>
        </Body>

        <Footer>
          <ResetBtn onClick={handleReset}>Reset to center</ResetBtn>
          <Actions>
            <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
            <PrimaryBtn onClick={handleSave}>Save crop</PrimaryBtn>
          </Actions>
        </Footer>
      </Panel>
    </Overlay>
  );
};
