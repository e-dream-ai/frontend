import React from "react";
import ModalProvider from "./modal.provider";
import QueryClientProvider from "./query-client.provider";

export const withProviders = (
  ...providers: Array<React.FC<{ children?: React.ReactNode }>>
) => {
  return (WrappedComponent: React.FC<{ children?: React.ReactNode }>) =>
    (props: object) =>
      providers.reduceRight(
        (acc, Provider) => {
          return <Provider>{acc}</Provider>;
        },
        <WrappedComponent {...props} />,
      );
};

export const Providers = [ModalProvider, QueryClientProvider];

export default Providers;
