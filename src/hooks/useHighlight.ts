import HighlightContext from "@/context/highlight.context";
import { useContext } from "react";

export const useHighlight = () => useContext(HighlightContext);

export default useHighlight;
