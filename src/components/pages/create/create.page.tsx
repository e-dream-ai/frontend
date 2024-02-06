import { TabList } from "@/components/shared/tabs/tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabPanel, Tabs } from "react-tabs";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { CreateDream } from "./create-dream";
import { CreatePlaylist } from "./create-playlist";

enum CREATE_TYPE {
  DREAM = 0,
  PLAYLIST = 1,
}

const SECTION_ID = "page";

export const CreatePage: React.FC = () => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState<CREATE_TYPE>(CREATE_TYPE.DREAM);

  return (
    <Container>
      <h2>{t("page.create.title")}</h2>
      <Section id={SECTION_ID}>
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>{t("page.create.dream_tab_title")}</Tab>
            <Tab>{t("page.create.playlist_tab_title")}</Tab>
          </TabList>
          <TabPanel>
            <CreateDream />
          </TabPanel>
          <TabPanel>
            <CreatePlaylist />
          </TabPanel>
        </Tabs>
      </Section>
    </Container>
  );
};
