import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { useState } from "react";
import styled from "styled-components";

const SectionID = "view-dream";

const ViewDreamPage: React.FC = () => {
  const [edit, setEdit] = useState(false);
  const handleEdit = () => setEdit(true);
  const save = () => setEdit(false);

  return (
    <Section id={SectionID}>
      <Container>
        <h2>View dream</h2>
        <Row justifyContent="space-between">
          <span />
          <div>
            {edit ? (
              <Button
                type="button"
                after={<i className="fa fa-save" />}
                onClick={save}
              >
                Save
              </Button>
            ) : (
              <Button
                type="button"
                after={<i className="fa fa-pencil" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
            <Button after={<i className="fa fa-thumbs-up" />} marginLeft>
              Upvote
            </Button>
            <Button after={<i className="fa fa-thumbs-down" />} marginLeft>
              Downvote
            </Button>
          </div>
        </Row>
        <Row>
          <form style={{ minWidth: "320px" }}>
            <Input
              disabled={!edit}
              placeholder="Name"
              type="text"
              before={<i className="fa fa-file-video-o" />}
            />
            <Input
              disabled={!edit}
              placeholder="Owner"
              type="text"
              before={<i className="fa fa-user" />}
            />
            <Input
              disabled={!edit}
              placeholder="Created"
              type="text"
              before={<i className="fa fa-calendar" />}
            />
            <Row justifyContent="space-between">
              <Text>5 votes</Text>
              <Text>2 downvotes</Text>
            </Row>
          </form>
        </Row>

        <h3>Video</h3>
        <Row>
          <VideoPlaceholder>
            <i className="fa fa-play" />
          </VideoPlaceholder>
        </Row>

        <h3>Tumbnail</h3>
        <Row>
          <TumbnailPlaceholder>
            <i className="fa fa-picture-o" />
          </TumbnailPlaceholder>
        </Row>
      </Container>
    </Section>
  );
};

const VideoPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(10, 10, 10, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;
const TumbnailPlaceholder = styled.div`
  width: 640px;
  height: 480px;
  background-color: rgba(10, 10, 10, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 6rem;
`;

export default ViewDreamPage;
