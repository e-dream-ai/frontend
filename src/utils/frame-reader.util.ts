import { createFile } from "mp4box";
import type { MP4ArrayBuffer, MP4File, MP4Info, MP4Sample } from "mp4box";

interface VideoTrackInfo {
  id: number;
  codec: string;
  track_width: number;
  track_height: number;
  timescale: number;
}

export class VideoFrameReader {
  private decoder: VideoDecoder | null = null;
  private frameCount = 0;

  extractFrames(
    videoUrl: string,
    onFrame: (frame: VideoFrame, index: number) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Create an inner async function for async behavior
      const run = async () => {
        try {
          if (!("VideoDecoder" in window)) {
            throw new Error("WebCodecs API is not supported");
          }

          // Fetch video data
          const response = await fetch(videoUrl);
          const buffer = await response.arrayBuffer();

          // Create MP4Box file
          const mp4boxFile: MP4File = createFile();

          mp4boxFile.onReady = (info: MP4Info) => {
            console.log("Video info:", info);

            const videoTrack = info.videoTracks[0] as unknown as VideoTrackInfo;

            this.decoder = new VideoDecoder({
              output: (frame: VideoFrame) => {
                onFrame(frame, this.frameCount++);
                frame.close();
              },
              error: (error: DOMException) => {
                console.error("Decoder error:", error);
                reject(error);
              },
            });

            const config: VideoDecoderConfig = {
              codec: videoTrack.codec,
              codedWidth: videoTrack.track_width,
              codedHeight: videoTrack.track_height,
            };

            this.decoder.configure(config);

            mp4boxFile.setExtractionOptions(
              videoTrack.id,
              {},
              { nbSamples: Infinity },
            );
            mp4boxFile.start();
          };

          mp4boxFile.onSamples = (
            _trackId: number,
            _ref: unknown,
            samples: MP4Sample[],
          ) => {
            for (const sample of samples) {
              if (!this.decoder) continue;

              const chunk = new EncodedVideoChunk({
                type: sample.is_sync ? "key" : "delta",
                timestamp: (sample.cts * 1_000_000) / sample.timescale,
                duration: (sample.duration * 1_000_000) / sample.timescale,
                data: sample.data,
              });

              this.decoder.decode(chunk);
            }
          };

          mp4boxFile.onError = (e: string) => {
            reject(new Error(`MP4Box error: ${e}`));
          };

          const mp4ArrayBuffer = buffer as MP4ArrayBuffer;
          mp4ArrayBuffer.fileStart = 0;

          mp4boxFile.appendBuffer(mp4ArrayBuffer);
          mp4boxFile.flush();

          if (this.decoder) {
            await this.decoder.flush();
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      // Call the async function, ensuring errors are caught
      run().catch(reject);
    });
  }

  cleanup(): void {
    this.decoder?.close();
    this.decoder = null;
    this.frameCount = 0;
  }
}
