import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { Footer, Header } from "components/shared";
import { AUTO_CLOSE_MS } from "constants/toast.constants";
import Providers, { withProviders } from "providers/providers";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router } from "routes/router";

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
    unregisterDocumentEvents();
  }, []);

  return (
    <>
      <ToastContainer
        theme="dark"
        position="bottom-right"
        autoClose={AUTO_CLOSE_MS}
      />
      <Header />
      <section style={{ paddingTop: "150px" }}></section>
      <RouterProvider router={router} />
      <section style={{ paddingTop: "150px" }}></section>
      <Footer />
    </>
  );
};

export default withProviders(...Providers)(App);
