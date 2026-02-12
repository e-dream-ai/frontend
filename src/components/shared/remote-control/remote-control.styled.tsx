import { DEVICES } from "@/constants/devices.constants";
import styled, { keyframes } from "styled-components";
import { Text } from "@/components/shared";
import { Link } from "react-router-dom";

export const RemoteControlContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  gap: 2em;
  width: 100%;

  /* Responsive layout for smaller screens */
  @media (max-width: ${DEVICES.TABLET}) {
    button {
      min-width: 44px;
      min-height: 44px;
    }
  }
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.3em;

  button {
    width: 100%;
  }

  &.row-3 {
    padding-left: 16%;
    padding-right: 7%;
  }
`;

export const RemoteControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5em;
  width: 100%;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    gap: 0.5em;
    justify-content: space-between;
  }
`;

export const ControlContainer = styled.div`
  gap: 0.3em;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  width: 100%;
  max-width: 80%;

  @media (max-width: ${DEVICES.TABLET}) {
    flex-direction: row;
    max-width: 100%;
  }
`;

export const IconButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s ease-in-out,
    opacity 0.2s ease-in-out;
  color: rgb(252, 217, 183);
  min-width: fit-content !important;
  min-height: fit-content !important;

  :hover {
    color: rgb(0, 208, 219);
  }

  :disabled {
    cursor: not-allowed;
    opacity: 0.5;

    :hover {
      color: rgb(252, 217, 183);
    }
  }
`;

export const IconRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    gap: 0.5em;
  }
`;

export const IconGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

export const TopControls = styled.div`
  display: flex;
  gap: 0.3em;
  padding-left: 7%;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.3em;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 1024px;
  justify-content: flex-start;

  @media (max-width: ${DEVICES.TABLET}) {
    width: 100%;
  }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const SkeletonBase = styled.div`
  background: ${(p) => p.theme.colorBackgroundQuaternary};
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0px,
    rgba(255, 255, 255, 0.08) 40px,
    rgba(255, 255, 255, 0) 80px
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: 4px;
`;

export const SkeletonArtwork = styled(SkeletonBase)`
  width: 96px;
  height: 54px;
  border-radius: 2px;
`;

export const SkeletonTitle = styled(SkeletonBase)`
  width: 160px;
  height: 20px;
`;

export const SkeletonMeta = styled(SkeletonBase)`
  width: 120px;
  height: 16px;
  margin-top: 6px;
`;

export const Artwork = styled.img`
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: 2px;
  background: ${(p) => p.theme.colorBackgroundQuaternary};
`;

export const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
`;

export const TrackInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
`;

export const TrackInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

export const TrackInfoRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 0.25rem;
  flex-shrink: 0;
`;

export const TimecodeText = styled(Text)`
  font-size: 1rem;
  font-weight: 600;
  color: ${(p) => p.theme.colorPrimary};
  white-space: nowrap;
`;

export const FpsText = styled(Text)`
  font-size: 0.875rem;
  color: ${(p) => p.theme.colorPrimary};
  white-space: nowrap;
`;

export const TrackTitle = styled(Text)`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(p) => p.theme.colorPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
`;

export const TrackMeta = styled(Text)`
  font-size: 1rem;
  color: ${(p) => p.theme.textPrimaryColor};
`;

export const DreamArtworkLink = styled(Link)`
  display: inline-flex;
  text-decoration: none;
`;

export const DreamInfoLink = styled(Link)`
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-decoration: none;
  color: inherit;
`;
