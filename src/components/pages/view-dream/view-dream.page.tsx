import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Section } from "components/shared/section/section";
import Text from "components/shared/text/text";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const SectionID = "view-dream";

const ViewDreamPage: React.FC = () => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(false);
  const handleEdit = () => setEdit(true);
  const save = () => setEdit(false);

  const [hasVideo, setHasVideo] = useState(true);
  const [hasTumbnail, setHasTumbnail] = useState(true);

  return (
    <Section id={SectionID}>
      <Container>
        <h2>{t("page.view_dream.view_dream")}</h2>
        <Row justifyContent="space-between">
          <span />
          <div>
            {edit ? (
              <Button
                type="button"
                after={<i className="fa fa-save" />}
                onClick={save}
              >
                {t("page.view_dream.save")}
              </Button>
            ) : (
              <Button
                type="button"
                after={<i className="fa fa-pencil" />}
                onClick={handleEdit}
              >
                {t("page.view_dream.edit")}
              </Button>
            )}
            <Button after={<i className="fa fa-thumbs-up" />} marginLeft>
              {t("page.view_dream.upvote")}
            </Button>
            <Button after={<i className="fa fa-thumbs-down" />} marginLeft>
              {t("page.view_dream.downvote")}
            </Button>
          </div>
        </Row>
        <Row>
          <form style={{ minWidth: "320px" }}>
            <Input
              disabled={!edit}
              placeholder={t("page.view_dream.name")}
              type="text"
              before={<i className="fa fa-file-video-o" />}
            />
            <Input
              disabled={!edit}
              placeholder={t("page.view_dream.owner")}
              type="text"
              before={<i className="fa fa-user" />}
            />
            <Input
              disabled={!edit}
              placeholder={t("page.view_dream.created")}
              type="text"
              before={<i className="fa fa-calendar" />}
            />
            <Row justifyContent="space-between">
              <Text>5 {t("page.view_dream.votes")}</Text>
              <Text>2 {t("page.view_dream.downvotes")}</Text>
            </Row>
          </form>
        </Row>

        <Row justifyContent="space-between" alignItems="center">
          <h3>{t("page.view_dream.video")}</h3>
          {edit && hasVideo && (
            <Button size="sm" onClick={() => setHasVideo(false)}>
              <i className="fa fa-trash" />
            </Button>
          )}
        </Row>
        <Row>
          {hasVideo ? (
            <VideoPlaceholder>
              <i className="fa fa-play" />
            </VideoPlaceholder>
          ) : (
            <FileUploader
              handleChange={() => setHasVideo(true)}
              name="file"
              types={["MP4"]}
            />
          )}
        </Row>

        <Row
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: "5rem" }}
        >
          <h3>{t("page.view_dream.tumbnail")}</h3>
          {edit && hasTumbnail && (
            <Button size="sm" onClick={() => setHasTumbnail(false)}>
              <i className="fa fa-trash" />
            </Button>
          )}
        </Row>
        <Row>
          {hasTumbnail ? (
            <TumbnailPlaceholder>
              <i className="fa fa-picture-o" />
            </TumbnailPlaceholder>
          ) : (
            <FileUploader
              handleChange={() => setHasTumbnail(true)}
              name="file"
              types={["JPEG", "JPG"]}
            />
          )}
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
