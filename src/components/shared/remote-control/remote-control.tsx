import React, { useEffect } from "react";
import io from "@/client/socket.client";
import { Button, Row } from "@/components/shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  REMOTE_CONTROLS,
  REMOTE_CONTROLS_TRANSLATIONS,
} from "@/constants/remote-control.constants";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const REMOTE_CONTROL_EVENT = "remote_control_event";
const NEW_REMOTE_CONTROL_EVENT = "new_remote_control_event";

export const RemoteControl: React.FC = () => {
  const { t } = useTranslation();
  // Listen for events from the server
  useEffect(() => {
    io.on(NEW_REMOTE_CONTROL_EVENT, (data) => {
      const command = data?.command;
      if (command) {
        toast.info(t(REMOTE_CONTROLS_TRANSLATIONS[command]));
      }
    });

    // Cleanup on component unmount
    return () => {
      io.off(NEW_REMOTE_CONTROL_EVENT);
    };
  }, []);

  // Emit an event to the server
  const sendMessage = (command: string) => () => {
    io.emit(REMOTE_CONTROL_EVENT, { command: command });
  };

  return (
    <Row>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM)}
      >
        <FontAwesomeIcon icon={faThumbsDown} />
      </Button>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER)}
      >
        <FontAwesomeIcon icon={faAngleDoubleLeft} />
      </Button>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM)}
      >
        <FontAwesomeIcon icon={faAngleLeft} />
      </Button>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM)}
      >
        <FontAwesomeIcon icon={faAngleRight} />
      </Button>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_FASTER)}
      >
        <FontAwesomeIcon icon={faAngleDoubleRight} />
      </Button>
      <Button
        size="sm"
        mr="0.4rem"
        onClick={sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM)}
      >
        <FontAwesomeIcon icon={faThumbsUp} />
      </Button>
    </Row>
  );
};
