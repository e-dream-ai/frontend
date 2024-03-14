export type RemoteControlAction = {
  event: string;
  key: string;
  [key: string]: unknown;
};

export type RemoteControlEvent = {
  event: string;
  name?: string;
  uuid?: string;
  id?: number;
  key?: string;
};
