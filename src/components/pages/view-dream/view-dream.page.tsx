import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import Text from "components/shared/text/text";

const ViewDreamPage: React.FC = () => {
  return (
    <Container>
      <Row justifyContent="space-between">
        <h2>View dream</h2>
        <div>
          <Button>Edit</Button>
          <Button>Upvote</Button>
          <Button>Downvote</Button>
        </div>
      </Row>
      <Row>
        <form>
          <Input
            placeholder="Name"
            type="text"
            before={<i className="fa fa-user" />}
          />
          <Input
            placeholder="Owner"
            type="text"
            before={<i className="fa fa-user" />}
          />
          <Input
            placeholder="Created"
            type="text"
            before={<i className="fa fa-user" />}
          />
          <Row justifyContent="space-between">
            <Text>5 votes</Text>
            <Text>2 downvotes</Text>
          </Row>
        </form>
      </Row>
    </Container>
  );
};

export default ViewDreamPage;
