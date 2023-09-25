import AuthProvider from "providers/auth.provider";
import ModalProvider from "providers/modal.provider";
import QueryClientProvider from "providers/query-client.provider";
import React from "react";

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

export const Providers = [ModalProvider, QueryClientProvider, AuthProvider];

export default Providers;
