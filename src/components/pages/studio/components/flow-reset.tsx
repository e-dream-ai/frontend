import { toast } from "react-toastify";
import { RotateCcw } from "lucide-react";
import { useFlowStore } from "@/stores/flow.store";
import { ResetButton } from "./flow-reset.styled";

export function FlowReset() {
  const resetFlow = useFlowStore((s) => s.resetFlow);
  const hasAnything = useFlowStore(
    (s) =>
      s.keyframes.length > 0 ||
      s.transitions.length > 0 ||
      s.globalPresetId !== "" ||
      s.globalPrompt !== "",
  );

  if (!hasAnything) return null;

  const handleReset = () => {
    resetFlow();
    toast.info("Flow reset");
  };

  return (
    <ResetButton type="button" onClick={handleReset} aria-label="Reset flow">
      <RotateCcw size={11} strokeWidth={2.2} />
      Reset
    </ResetButton>
  );
}
