import SocketContext from "@/context/socket.context";
import { useContext } from "react";

export const useSocket = () => useContext(SocketContext);

export default useSocket;
