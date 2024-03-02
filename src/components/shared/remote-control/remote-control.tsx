import React, { useEffect } from "react";
import { Button, Row } from "@/components/shared";
import {
  REMOTE_CONTROLS,
  REMOTE_CONTROLS_TRANSLATIONS,
} from "@/constants/remote-control.constants";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useIO from "@/hooks/useIO";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { RemoteControlAction } from "@/types/remote-control.types";

const NEW_REMOTE_CONTROL_EVENT = "new_remote_control_event";

export const RemoteControl: React.FC = () => {
  const { t } = useTranslation();
  const { io } = useIO();

  // Listen for events from the server
  useEffect(() => {
    io?.on(NEW_REMOTE_CONTROL_EVENT, (data): void => {
      const event: RemoteControlAction | undefined = getRemoteControlEvent(
        data?.event,
      );

      if (!event) {
        return;
      }

      const key = event?.key;

      if (event) {
        toast.info(
          `${t("components.remote_control.event")}: ${
            key ? `(${key})` : ""
          } ${t(REMOTE_CONTROLS_TRANSLATIONS[event?.key])}`,
        );
      }
    });

    // Cleanup on component unmount
    return () => {
      io?.off(NEW_REMOTE_CONTROL_EVENT);
    };
  }, [io, t]);

  // Emit an event to the server
  const sendMessage = (event: string) => () => {
    io?.emit(NEW_REMOTE_CONTROL_EVENT, { event: event });
  };

  return (
    <Row flexWrap="wrap" style={{ gap: "4px" }}>
      {Object.keys(REMOTE_CONTROLS).map((key) => {
        const REMOTE_CONTROL = REMOTE_CONTROLS[key];
        return (
          <Button
            size="sm"
            mr="0.4rem"
            onClick={sendMessage(REMOTE_CONTROL?.event)}
          >
            {t(`components.remote_control.${REMOTE_CONTROL?.event}`)}
          </Button>
        );
      })}
    </Row>
  );
};
