import { Footer, Header } from "components/shared";
import Providers, { withProviders } from "providers/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer theme="colored" position="bottom-right" />
      <Header />
      <section style={{ height: "800px" }}></section>
      <Footer />
    </>
  );
};

export default withProviders(...Providers)(App);
