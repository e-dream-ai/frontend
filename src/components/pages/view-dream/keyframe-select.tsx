import { useState } from "react";
import { useKeyframes } from "@/api/keyframe/query/useKeyframes";
import { Control, Controller } from "react-hook-form";
import { UpdateDreamFormValues } from "@/schemas/update-dream.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import Select from "@/components/shared/select/select";

type KeyframeSelectProps = {
  name: "startKeyframe" | "endKeyframe";
  placeholder: string;
  control: Control<UpdateDreamFormValues>
  editMode: boolean;
}

export const KeyframeSelect = ({
  name,
  control,
  placeholder,
  editMode
}: KeyframeSelectProps) => {
  const [keyframeSearch, setKeyframeSearch] = useState<string>("");

  const { data: keyframesData, isLoading: isKeyframesLoading } = useKeyframes({
    search: keyframeSearch,
  });

  const keyframesOptions = (keyframesData?.data?.keyframes ?? [])
    .filter((keyframe) => keyframe.name)
    .map((keyframe) => ({
      label: keyframe?.name ?? "-",
      value: keyframe?.uuid,
    }));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          placeholder={placeholder}
          isDisabled={!editMode}
          isLoading={isKeyframesLoading}
          before={<FontAwesomeIcon icon={faImage} />}
          options={keyframesOptions}
          onInputChange={(newValue) => setKeyframeSearch(newValue)}
        />
      )}
    />
  );
};
