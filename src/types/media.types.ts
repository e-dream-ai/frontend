export type FileTypes = File;

export type MultiMediaState =
  | {
      file?: FileTypes;
      url: string;
    }
  | undefined;

export type HandleChangeFile = (arg0: File | FileList) => void;
