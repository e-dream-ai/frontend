import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { AUTO_CLOSE_MS } from "@/constants/toast.constants";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "@/routes/router";
import TagManager from "react-gtm-module";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  /**
   * Unregister document events to allow dragover
   */
  const unregisterDocumentEvents = () => {
    document.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
  };

  useEffect(() => {

    /**
     * Initialize TagManager
     */
    TagManager.initialize({ gtmId: import.meta.env.VITE_GTM_ID });

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

export default App;
