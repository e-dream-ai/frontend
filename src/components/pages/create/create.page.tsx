import { TabList } from "@/components/shared/tabs/tabs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tab, TabPanel, Tabs } from "react-tabs";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { CreateDream } from "./create-dream";
import { CreatePlaylist } from "./create-playlist";
import { UpdatePlaylist } from "./update-playlist/update-playlist";
import { CreateKeyframe } from "./create-keyframe";
import { DREAM_PERMISSIONS } from "@/constants/permissions.constants";
import Restricted from "@/components/shared/restricted/restricted";
import Text from "@/components/shared/text/text";
import { Anchor } from "@/components/shared";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  CREATE_ROUTES,
  FULL_CREATE_ROUTES,
} from "@/constants/routes.constants";
import usePermission from "@/hooks/usePermission";

enum CREATE_TYPE {
  DREAM = 0,
  PLAYLIST = 1,
  ADD_TO_PLAYLIST = 2,
  KEYFRAME = 3,
}

const SECTION_ID = "page";

export const CreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreator = usePermission({
    permission: DREAM_PERMISSIONS.CAN_CREATE_DREAM,
  });

  const defaultTabIndex = isCreator ? CREATE_TYPE.DREAM : CREATE_TYPE.PLAYLIST;
  const [tabIndex, setTabIndex] = useState(defaultTabIndex);

  useEffect(() => {
    switch (location.pathname) {
      case FULL_CREATE_ROUTES.DREAM:
        setTabIndex(CREATE_TYPE.DREAM);
        break;
      case FULL_CREATE_ROUTES.PLAYLIST:
        setTabIndex(CREATE_TYPE.PLAYLIST);
        break;
      case FULL_CREATE_ROUTES.ADD_ITEM_TO_PLAYLIST:
        setTabIndex(CREATE_TYPE.ADD_TO_PLAYLIST);
        break;
      case FULL_CREATE_ROUTES.ADD_KEYFRAME_TO_PLAYLIST:
        setTabIndex(CREATE_TYPE.KEYFRAME);
        break;
      default:
        setTabIndex(defaultTabIndex);
    }
  }, [location.pathname, defaultTabIndex]);

  const handleSelect = (index: number) => {
    const paths = [
      FULL_CREATE_ROUTES.DREAM,
      FULL_CREATE_ROUTES.PLAYLIST,
      FULL_CREATE_ROUTES.ADD_ITEM_TO_PLAYLIST,
      FULL_CREATE_ROUTES.ADD_KEYFRAME_TO_PLAYLIST,
    ];
    navigate(paths[index]);
  };

  return (
    <Container>
      <h2>{t("page.create.title")}</h2>
      <Section id={SECTION_ID}>
        <Tabs selectedIndex={tabIndex} onSelect={handleSelect}>
          <TabList>
            <Tab tabIndex={`${CREATE_TYPE.DREAM}`}>
              {t("page.create.dream_tab_title")}
            </Tab>
            <Tab tabIndex={`${CREATE_TYPE.PLAYLIST}`}>
              {t("page.create.playlist_tab_title")}
            </Tab>
            <Tab tabIndex={`${CREATE_TYPE.ADD_TO_PLAYLIST}`}>
              {t("page.create.add_to_playlist_tab_title")}
            </Tab>
            <Tab tabIndex={`${CREATE_TYPE.KEYFRAME}`}>
              {t("page.create.keyframe_title")}
            </Tab>
          </TabList>

          <TabPanel tabIndex={CREATE_TYPE.DREAM}>
            <Routes>
              <Route
                path={CREATE_ROUTES.DREAM}
                element={
                  <>
                    <Restricted to={DREAM_PERMISSIONS.CAN_CREATE_DREAM}>
                      <CreateDream />
                    </Restricted>
                    <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_BECOME_CREATOR}>
                      <Text>
                        {t("page.create.become_creator")}{" "}
                        <Anchor href="https://forms.gle/JsZb4TRdw3jq65Bc8">
                          Creators Program
                        </Anchor>
                        .
                      </Text>
                    </Restricted>
                  </>
                }
              />
            </Routes>
          </TabPanel>

          <TabPanel tabIndex={CREATE_TYPE.PLAYLIST}>
            <Routes>
              <Route
                path={CREATE_ROUTES.PLAYLIST}
                element={<CreatePlaylist />}
              />
            </Routes>
          </TabPanel>

          <TabPanel tabIndex={CREATE_TYPE.ADD_TO_PLAYLIST}>
            <Routes>
              <Route
                path={CREATE_ROUTES.ADD_ITEM_TO_PLAYLIST}
                element={
                  <>
                    <Restricted to={DREAM_PERMISSIONS.CAN_CREATE_DREAM}>
                      <UpdatePlaylist />
                    </Restricted>
                    <Restricted to={DREAM_PERMISSIONS.CAN_VIEW_BECOME_CREATOR}>
                      <Text>
                        {t("page.create.become_creator")}{" "}
                        <Anchor href="https://forms.gle/JsZb4TRdw3jq65Bc8">
                          Creators Program
                        </Anchor>
                        .
                      </Text>
                    </Restricted>
                  </>
                }
              />
            </Routes>
          </TabPanel>

          <TabPanel tabIndex={CREATE_TYPE.KEYFRAME}>
            <Routes>
              <Route
                path={CREATE_ROUTES.ADD_KEYFRAME_TO_PLAYLIST}
                element={<CreateKeyframe />}
              />
            </Routes>
          </TabPanel>
        </Tabs>
      </Section>
    </Container>
  );
};
