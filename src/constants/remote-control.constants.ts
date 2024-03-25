import { RemoteControlAction } from "@/types/remote-control.types";

export const NEW_REMOTE_CONTROL_EVENT = "new_remote_control_event";

export const REMOTE_CONTROLS: { [key: string]: RemoteControlAction } = {
  PLAYING: { event: "playing", key: "" },
  PLAY_DREAM: { event: "play_dream", key: "" },
  PLAY_PLAYLIST: { event: "play_playlist", key: "" },
  DISLIKE_CURRENT_DREAM: { event: "dislike", key: "↓" },
  LIKE_CURRENT_DREAM: { event: "like", key: "↑" },
  GO_PREVIOUS_DREAM: { event: "previous", key: "←" },
  GO_NEXT_DREAM: { event: "next", key: "→" },
  PLAYBACK_SLOWER: { event: "playback_slower", key: "A" },
  PLAYBACK_FASTER: { event: "playback_faster", key: "D" },
  FORWARD: { event: "forward", key: "L" },
  BACKWARD: { event: "backward", key: "J" },
  BRIGHTER: { event: "brighter", key: "W" },
  DARKER: { event: "darker", key: "S" },
  CREDIT: { event: "credit", key: "C" },
  WEB: { event: "web", key: "V" },
  HELP: { event: "help", key: "F1" },
  STATUS: { event: "status", key: "F2" },
  SET_SPEED_1: { event: "set_speed_1", key: "1" },
  SET_SPEED_2: { event: "set_speed_2", key: "" },
  SET_SPEED_3: { event: "set_speed_3", key: "" },
  SET_SPEED_4: { event: "set_speed_4", key: "" },
  SET_SPEED_5: { event: "set_speed_5", key: "" },
  SET_SPEED_6: { event: "set_speed_6", key: "" },
  SET_SPEED_7: { event: "set_speed_7", key: "" },
  SET_SPEED_8: { event: "set_speed_8", key: "" },
  SET_SPEED_9: { event: "set_speed_9", key: "9" },
  PAUSE_1: { event: "pause", key: "0" },
  PAUSE_2: { event: "pause", key: "K" },
  CAPTURE: { event: "capture", key: "T" },
  REPORT: { event: "report", key: "R, !" },
  RESET_PLAYLIST: { event: "reset_playlist", key: "" },
};

export const REMOTE_CONTROLS_TRANSLATIONS = {
  [REMOTE_CONTROLS.PLAY_DREAM.event]: "components.remote_control.play_dream",
  [REMOTE_CONTROLS.PLAY_PLAYLIST.event]:
    "components.remote_control.play_playlist",
  [REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event]: "components.remote_control.like",
  [REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event]:
    "components.remote_control.dislike",
  [REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event]:
    "components.remote_control.previous",
  [REMOTE_CONTROLS.GO_NEXT_DREAM.event]: "components.remote_control.next",
  [REMOTE_CONTROLS.PLAYBACK_SLOWER.event]:
    "components.remote_control.playback_slower",
  [REMOTE_CONTROLS.PLAYBACK_FASTER.event]:
    "components.remote_control.playback_faster",
  [REMOTE_CONTROLS.FORWARD.event]: "components.remote_control.forward",
  [REMOTE_CONTROLS.BACKWARD.event]: "components.remote_control.backward",
  [REMOTE_CONTROLS.BRIGHTER.event]: "components.remote_control.brighter",
  [REMOTE_CONTROLS.DARKER.event]: "components.remote_control.darker",
  [REMOTE_CONTROLS.CREDIT.event]: "components.remote_control.credit",
  [REMOTE_CONTROLS.WEB.event]: "components.remote_control.web",
  [REMOTE_CONTROLS.HELP.event]: "components.remote_control.help",
  [REMOTE_CONTROLS.STATUS.event]: "components.remote_control.status",
  [REMOTE_CONTROLS.SET_SPEED_1.event]: "components.remote_control.set_speed_1",
  [REMOTE_CONTROLS.SET_SPEED_2.event]: "components.remote_control.set_speed_2",
  [REMOTE_CONTROLS.SET_SPEED_3.event]: "components.remote_control.set_speed_3",
  [REMOTE_CONTROLS.SET_SPEED_4.event]: "components.remote_control.set_speed_4",
  [REMOTE_CONTROLS.SET_SPEED_5.event]: "components.remote_control.set_speed_5",
  [REMOTE_CONTROLS.SET_SPEED_6.event]: "components.remote_control.set_speed_6",
  [REMOTE_CONTROLS.SET_SPEED_7.event]: "components.remote_control.set_speed_7",
  [REMOTE_CONTROLS.SET_SPEED_8.event]: "components.remote_control.set_speed_8",
  [REMOTE_CONTROLS.SET_SPEED_9.event]: "components.remote_control.set_speed_9",
  [REMOTE_CONTROLS.PAUSE_1.event]: "components.remote_control.pause",
  [REMOTE_CONTROLS.PAUSE_2.event]: "components.remote_control.pause",
  [REMOTE_CONTROLS.CAPTURE.event]: "components.remote_control.capture",
  [REMOTE_CONTROLS.REPORT.event]: "components.remote_control.report",
  [REMOTE_CONTROLS.RESET_PLAYLIST.event]:
    "components.remote_control.reset_playlist",
};
