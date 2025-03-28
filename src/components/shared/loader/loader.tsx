import Row from "../row/row";
import { Spinner } from "../spinner/spinner";

export const Loader: React.FC = () => (
  <Row justifyContent="center" mt="2rem">
    <Spinner />
  </Row>
);