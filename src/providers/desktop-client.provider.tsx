import { DesktopClientProvider as DCP } from "@/context/desktop-client.context";

export const DesktopClientProvider: React.FC<{
    children?: React.ReactNode;
}> = ({ children }) => <DCP>{children}</DCP>;

export default DesktopClientProvider;
