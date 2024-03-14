import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { AUTO_CLOSE_MS } from "@/constants/toast.constants";
import Providers, { withProviders } from "@/providers/providers";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import useSocket from "@/hooks/useSocket";
import { router } from "@/routes/router";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { onNewRemoteControlEvent } from "@/utils/socket.util";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { t } = useTranslation();
  const { socket } = useSocket();
  /**
   * Unregister document events to allow dragover
   */
  const unregisterDocumentEvents = () => {
    document.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
  };

  /**
   * Listen new remote control events from the server
   */
  useEffect(() => {
    const handleEvent = onNewRemoteControlEvent(t);
    socket?.on(NEW_REMOTE_CONTROL_EVENT, handleEvent);

    // Cleanup on component unmount
    return () => {
      socket?.off(NEW_REMOTE_CONTROL_EVENT);
    };
  }, [socket, t]);

  useEffect(() => {
    unregisterDocumentEvents();
  }, []);

  return (
    <>
      <ToastContainer
        theme="dark"
        position="bottom-right"
        autoClose={AUTO_CLOSE_MS}
      />
      <RouterProvider router={router} />
    </>
  );
};

const AppWithProviders = withProviders(...Providers)(App);

export default AppWithProviders;
