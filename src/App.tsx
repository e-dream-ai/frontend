import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Footer } from "./components/shared/footer/footer";
import { Header } from "./components/shared/header/header";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <section style={{ height: "800px" }}></section>
      <Footer />
    </QueryClientProvider>
  );
};

export default App;
