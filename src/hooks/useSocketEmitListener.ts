import { useEffect } from "react";
import useSocket from "./useSocket";
import { EmitListener } from "@/types/socket.types";

export const useSocketEmitListener = (callback: EmitListener) => {
  const { addEmitListener, removeEmitListener } = useSocket();

  useEffect(() => {
    addEmitListener(callback);
    return () => removeEmitListener(callback);
  }, [callback, addEmitListener, removeEmitListener]);
};
