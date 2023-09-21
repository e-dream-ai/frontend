import { QueryClientProvider as QCP, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

export const QueryClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <QCP client={queryClient}>{children}</QCP>;
};

export default QueryClientProvider;
