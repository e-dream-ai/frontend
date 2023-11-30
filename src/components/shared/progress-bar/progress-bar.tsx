import {
  ProgressBarProps,
  default as RamonakProgressBar,
} from "@ramonak/react-progress-bar";
import styled, { useTheme } from "styled-components";

const StyledProgressBar = styled(RamonakProgressBar)``;

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const theme = useTheme();
  return (
    <StyledProgressBar
      bgColor={theme.colorPrimary}
      baseBgColor={theme.inputBackgroundColor}
      {...props}
    />
  );
};

export default ProgressBar;
