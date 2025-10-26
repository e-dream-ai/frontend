declare module "mp4box" {
  export interface MP4Track {
    id: number;
    codec: string;
    created: Date;
    modified: Date;
    timescale: number;
    duration: number;
    bitrate: number;
    language: string;
    nb_samples: number;

    [key: string]: unknown;
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    isFragmented: boolean;
    isProgressive: boolean;
    hasIOD: boolean;
    brands: string[];
    created: Date;
    modified: Date;
    tracks: MP4Track[];
    videoTracks: MP4Track[];
    audioTracks: MP4Track[];
  }

  export interface MP4Sample {
    number: number;
    track_id: number;
    timescale: number;
    dts: number;
    cts: number;
    duration: number;
    size: number;
    is_sync: boolean;
    data: ArrayBuffer;
  }

  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void;
    onError?: (e: string) => void;
    onSamples?: (id: number, user: unknown, samples: MP4Sample[]) => void;
    appendBuffer(data: MP4ArrayBuffer): number;
    start(): void;
    stop(): void;
    flush(): void;
    setExtractionOptions(
      trackId: number,
      user?: unknown,
      options?: { nbSamples?: number },
    ): void;
    getTrackById(id: number): MP4Track | undefined;
  }

  export class DataStream {
    constructor(
      buffer: ArrayBuffer | undefined,
      byteOffset: number,
      endianness: boolean,
    );
    static BIG_ENDIAN: boolean;
    static LITTLE_ENDIAN: boolean;
    buffer: ArrayBuffer;
    position: number;
    writeUint8(value: number): void;
    writeUint16(value: number): void;
    writeUint8Array(array: Uint8Array): void;
  }

  // Named export instead of default
  export function createFile(): MP4File;
}
