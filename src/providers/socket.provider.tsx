import { SocketProvider as SP } from "@/context/socket.context";

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <SP>{children}</SP>;

export default SocketProvider;
