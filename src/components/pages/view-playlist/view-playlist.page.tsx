import { Button, Input, Row } from "components/shared";
import Container from "components/shared/container/container";
import { Column } from "components/shared/row/row";
import { Section } from "components/shared/section/section";
import { useTranslation } from "react-i18next";
import { ThumbnailPlaceholder } from "../view-dream/view-dream.styled";

const SectionID = "playlist";

export const ViewPlaylistPage = () => {
  const { t } = useTranslation();
  return (
    <Section id={SectionID}>
      <Container>
        <form style={{ minWidth: "320px" }}>
          <h2>{t("page.view_playlist.title")}</h2>

          <Row justifyContent="space-between">
            <span />
            <Button
              type="button"
              after={<i className="fa fa-pencil" />}
              // onClick={handleEdit}
            >
              {t("page.view_dream.edit")}
            </Button>
          </Row>

          <Column>
            <Input
              //   disabled={!editMode}
              placeholder={t("page.view_dream.name")}
              type="text"
              before={<i className="fa fa-file-video-o" />}
              //   error={errors.name?.message}
              //   {...register("name")}
            />
            <Input
              disabled
              placeholder={t("page.view_dream.owner")}
              type="text"
              before={<i className="fa fa-user" />}
              //   {...register("owner")}
            />
            <Input
              disabled
              placeholder={t("page.view_dream.created")}
              type="text"
              before={<i className="fa fa-calendar" />}
              //   {...register("created_at")}
            />
          </Column>
          <Row
            justifyContent="space-between"
            alignItems="center"
            style={{ marginTop: "5rem" }}
          >
            <h3>{t("page.view_dream.thumbnail")}</h3>
          </Row>
          <Row>
            <ThumbnailPlaceholder>
              <i className="fa fa-picture-o" />
            </ThumbnailPlaceholder>
          </Row>
        </form>
      </Container>
    </Section>
  );
};
