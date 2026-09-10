import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { StudioResetButton } from "./reset-button";

export function FlowReset() {
  const resetFlow = useFlowStore((s) => s.resetFlow);
  const hasAnything = useFlowStore(
    (s) =>
      s.referenceFrames.length > 0 ||
      s.transitions.length > 0 ||
      s.globalPresetId !== "" ||
      s.globalPrompt !== "",
  );

  if (!hasAnything) return null;

  const handleReset = () => {
    resetFlow();
    toast.info("Flow reset");
  };

  return <StudioResetButton label="Reset flow" onReset={handleReset} />;
}
