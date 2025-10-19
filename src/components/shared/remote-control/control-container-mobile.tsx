import React from "react";
import { Button } from "@/components/shared";
import { useTranslation } from "react-i18next";
import { ControlContainer } from "./remote-control.styled";
import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "@/types/remote-control.types";

export interface ControlContainerMobileProps {
  onSend: (event: RemoteControlEvent) => () => void;
}

const ROW_1 = [REMOTE_CONTROLS.HELP, REMOTE_CONTROLS.STATUS];

const ROW_2 = [
  REMOTE_CONTROLS.SET_SPEED_1,
  REMOTE_CONTROLS.SET_SPEED_2,
  REMOTE_CONTROLS.SET_SPEED_3,
  REMOTE_CONTROLS.SET_SPEED_4,
  REMOTE_CONTROLS.SET_SPEED_5,
  REMOTE_CONTROLS.SET_SPEED_6,
  REMOTE_CONTROLS.SET_SPEED_7,
  REMOTE_CONTROLS.SET_SPEED_8,
  REMOTE_CONTROLS.SET_SPEED_9,
  REMOTE_CONTROLS.PAUSE_1,
];

export const ControlContainerMobile: React.FC<ControlContainerMobileProps> = ({
  onSend,
}) => {
  const { t } = useTranslation();

  return (
    <ControlContainer>
      {ROW_1.map((control) => (
        <Button
          key={control.event}
          buttonType="tertiary"
          size="sm"
          fontSize="0.8rem"
          textTransform="none"
          onClick={onSend(control.event)}
        >
          {control.key + " " + t(`components.remote_control.${control.event}`)}
        </Button>
      ))}

      {ROW_2.map((control) => (
        <Button
          key={control.event}
          buttonType="tertiary"
          size="sm"
          fontSize="0.8rem"
          textTransform="none"
          onClick={onSend(control.event)}
        >
          {control.key + " " + t(`components.remote_control.${control.event}`)}
        </Button>
      ))}

      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.BRIGHTER.event)}
      >
        {REMOTE_CONTROLS.BRIGHTER.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.BRIGHTER.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.DARKER.event)}
      >
        {REMOTE_CONTROLS.DARKER.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.DARKER.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.WEB.event)}
      >
        {REMOTE_CONTROLS.WEB.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.WEB.event}`)}
      </Button>

      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.BACKWARD.event)}
      >
        {REMOTE_CONTROLS.BACKWARD.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.BACKWARD.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.PAUSE_2.event)}
      >
        {REMOTE_CONTROLS.PAUSE_2.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.PAUSE_2.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={onSend(REMOTE_CONTROLS.FORWARD.event)}
      >
        {REMOTE_CONTROLS.FORWARD.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.FORWARD.event}`)}
      </Button>
    </ControlContainer>
  );
};
