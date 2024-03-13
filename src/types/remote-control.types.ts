export type RemoteControlAction = {
  event: string;
  key: string;
  order: number;
  [key: string]: unknown;
};
