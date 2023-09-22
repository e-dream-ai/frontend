import { QueryClientProvider as QCP } from "@tanstack/react-query";
import queryClient from "api/query-client";

export const QueryClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <QCP client={queryClient}>{children}</QCP>;
};

export default QueryClientProvider;
