import { TabList } from "@/components/shared/tabs/tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabPanel, Tabs } from "react-tabs";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { CreateDream } from "./create-dream";
import { CreatePlaylist } from "./create-playlist";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import usePermission from "@/hooks/usePermission";

enum CREATE_TYPE {
  DREAM = 0,
  PLAYLIST = 1,
}

const SECTION_ID = "page";

export const CreatePage: React.FC = () => {
  const { t } = useTranslation();
  const allowedCreateDream = usePermission({
    permission: DREAM_PERMISSIONS.CAN_CREATE_DREAM,
  });

  const [tabIndex, setTabIndex] = useState<CREATE_TYPE>(
    allowedCreateDream ? CREATE_TYPE.DREAM : CREATE_TYPE.PLAYLIST,
  );

  return (
    <Container>
      <h2>{t("page.create.title")}</h2>
      <Section id={SECTION_ID}>
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList>
            <Tab tabIndex={`${CREATE_TYPE.DREAM}`} hidden={!allowedCreateDream}>
              {t("page.create.dream_tab_title")}
            </Tab>
            <Tab tabIndex={`${CREATE_TYPE.PLAYLIST}`}>
              {t("page.create.playlist_tab_title")}
            </Tab>
          </TabList>

          <TabPanel tabIndex={CREATE_TYPE.DREAM}>
            <CreateDream />
          </TabPanel>

          <TabPanel tabIndex={CREATE_TYPE.PLAYLIST}>
            <CreatePlaylist />
          </TabPanel>
        </Tabs>
      </Section>
    </Container>
  );
};
