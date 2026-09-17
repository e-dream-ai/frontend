import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { StudioResetButton } from "./reset-button";

export function FlowReset() {
  const resetFlow = useFlowStore((s) => s.resetFlow);
  // Settings live on transitions now, so there is no separate "edited the
  // globals but added nothing" state to keep the button alive for.
  const hasAnything = useFlowStore(
    (s) => s.referenceFrames.length > 0 || s.transitions.length > 0,
  );

  if (!hasAnything) return null;

  const handleReset = () => {
    resetFlow();
    toast.info("Flow reset");
  };

  return <StudioResetButton label="Reset flow" onReset={handleReset} />;
}
