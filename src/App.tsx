import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { AUTO_CLOSE_MS } from "@/constants/toast.constants";
import Providers, { withProviders } from "@/providers/providers";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { router } from "@/routes/router";
import { onNewRemoteControlEvent } from "@/utils/socket.util";
import "react-toastify/dist/ReactToastify.css";
import useRemoteControlSocket from "./hooks/useRemoteControlSocket";

const App = () => {
  const { t } = useTranslation();

  /**
   * Unregister document events to allow dragover
   */
  const unregisterDocumentEvents = () => {
    document.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
  };

  const handleRemoteControlEvent = onNewRemoteControlEvent(t);

  /**
   * Listen new remote control events from the server
   */
  useRemoteControlSocket(handleRemoteControlEvent);

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
