import { Spinner } from "../spinner/spinner";
import { Overlay } from "./route-loader.styled";

export const RouteLoader: React.FC = () => (
  <Overlay role="status" aria-live="polite">
    <Spinner />
    Loading
  </Overlay>
);
