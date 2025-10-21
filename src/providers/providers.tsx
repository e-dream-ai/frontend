import React from "react";
import AuthProvider from "@/providers/auth.provider";
import ModalProvider from "@/providers/modal.provider";
import QueryClientProvider from "@/providers/query-client.provider";
import HighlightContext from "@/providers/highlight.provider";
import PermissionProvider from "./permission.provider";
import SocketProvider from "./socket.provider";
import DeviceRoleProvider from "./device-role.provider";
import DesktopClientProvider from "./desktop-client.provider";
import WebClientProvider from "./web-client.provider";
import VideoJSProvider from "./video-js.provider";

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

export const Providers = [
  QueryClientProvider,
  AuthProvider,
  HighlightContext,
  ModalProvider,
  PermissionProvider,
  SocketProvider,
  DeviceRoleProvider,
  DesktopClientProvider,
  VideoJSProvider,
  WebClientProvider,
];

export default Providers;
