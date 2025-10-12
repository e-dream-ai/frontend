import { WebClientProvider as WCP } from "@/context/web-client.context";

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <WCP>{children}</WCP>;

export default WebClientProvider;
