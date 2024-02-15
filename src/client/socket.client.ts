import socketIO from "socket.io-client";
import { SOCKET_URL } from "@/constants/api.constants";
import { AUTH_LOCAL_STORAGE_KEY } from "@/constants/auth.constants";
import { UserWithToken } from "@/types/auth.types";

const REMOTE_CONTROL_NAMESPACE = "remote-control";

const storagedUser = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
const user: UserWithToken = JSON.parse(storagedUser ?? "{}");

// Connect to Socket.IO server
const io = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
  query: {
    token: user?.token?.AccessToken ? `Bearer ${user?.token?.AccessToken}` : "",
  },
});
// const io = socketIO(`${SOCKET_URL}`);

export default io;
