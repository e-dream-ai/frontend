import React from "react";
import { Counter } from "./components/Counter";
import logo from "./logo.svg";
import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Hello world!</p>

          <section>
            <Counter />
          </section>
        </header>
      </div>
    </QueryClientProvider>
  );
}

export default App;
