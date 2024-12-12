import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Row, { Column } from "../row/row";
import Text from "../text/text";
import {
  faShareFromSquare,
  faSquarePlus,
} from "@fortawesome/free-solid-svg-icons";

export const AddToIosSafari = () => (
  <Row>
    <Column>
      <Text my={3}>
        We recommend installing the e-dream app to your home screen.
      </Text>
      <Text my={3}>
        Click the <FontAwesomeIcon icon={faShareFromSquare} /> icon.
      </Text>

      <Text my={3}>Scroll down and then click:</Text>

      <Row
        justifyContent="space-between"
        px={3}
        py={2}
        style={{ background: "#333" }}
      >
        <Text color="white">Add to Home Screen</Text>
        <Text color="white">
          <FontAwesomeIcon icon={faSquarePlus} />
        </Text>
      </Row>
    </Column>
  </Row>
);
