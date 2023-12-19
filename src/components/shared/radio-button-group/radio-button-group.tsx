import RadioButton from "../radio-button/radio-button";
import { StyledRadioButtonGroup } from "./radio-button-group.styled";

type RadioButtonGroupProps = {
  name: string;
  value?: string;
  data?: Array<{ key: string; value: string }>;
  onChange?: (value?: string) => void;
};

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  name,
  value,
  data,
  onChange,
}) => {
  return (
    <StyledRadioButtonGroup>
      {data?.map((element) => (
        <RadioButton
          key={element.key}
          name={name}
          id={element.key}
          value={element.value}
          checked={element.value === value}
          onSelect={onChange}
        />
      ))}
    </StyledRadioButtonGroup>
  );
};

export default RadioButtonGroup;
