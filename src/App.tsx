import { Footer, Header } from "./components/shared";
import Providers, { withProviders } from "./providers/providers";

const App = () => {
  return (
    <>
      <Header />
      <section style={{ height: "800px" }}></section>
      <Footer />
    </>
  );
};

export default withProviders(...Providers)(App);
