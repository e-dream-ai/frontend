import { Footer, Header } from "components/shared";
import Providers, { withProviders } from "providers/providers";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { router } from "routes/router";

const App = () => {
  return (
    <>
      <ToastContainer theme="colored" position="bottom-right" />
      <Header />
      <section style={{ paddingTop: "150px" }}></section>
      <RouterProvider router={router} />
      <Footer />
    </>
  );
};

export default withProviders(...Providers)(App);
