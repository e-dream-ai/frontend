import { HighlightProvider as HP } from "@/context/highlight.context";

export const HighlightProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <HP>{children}</HP>;

export default HighlightProvider;
