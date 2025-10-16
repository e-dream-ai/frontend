import { VideoJSProvider as VJSP } from "@/context/video-js.context";

export const VideoJSProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <VJSP>{children}</VJSP>;

export default VideoJSProvider;
