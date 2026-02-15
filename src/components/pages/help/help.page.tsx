import { Anchor, Button, Row } from "@/components/shared";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { ROUTES } from "@/constants/routes.constants";
import PlaylistPlay from "@/icons/playlist-play";
import router from "@/routes/router";
import styled from "styled-components";

const SECTION_ID = "help";
const HELP_VIDEO_URL = "https://www.youtube.com/embed/yHrwo4asw4Y?si=SFBEZNR6_ECSxfgb";
const DOCS_URLS = {
  userManual: "https://docs.google.com/document/d/e/2PACX-1vRK77s1OWASmJ_r8ZZXkFzNxpSxoqcOVn2-0shwXZquzxsWfzO86oeH_9Q09IVmb5gaUnuHZQP0ZihG/pub",
  creatorsGuide: "https://docs.google.com/document/u/1/d/e/2PACX-1vTQnJMCLOqenrCADZyrXxgBTahQ4sPyRRj7GrhMEu_DkmScRRGOjRJQmd2rkH1-_K0WRjfGYd04rhJB/pub",
  pythonAPI: "https://github.com/e-dream-ai/python-api",
} as const;

const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Card components
const HelpCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
  border: 1px solid ${(props) => props.theme.textPrimaryColor};
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${(props) => props.theme.textAccentColor};
`;

const CardText = styled.div`
  margin: 0;
  color: ${(props) => props.theme.textAccentColor};
  line-height: 1.45;
`;

const TipsList = styled.ul`
  margin: 0 0 0 1.2rem;
  padding: 0;
  color: ${(props) => props.theme.textAccentColor};

  li + li {
    margin-top: 0.5rem;
  }
`;

// Media components
const VideoFrame = styled.iframe`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
`;

const RemoteImage = styled.img`
  display: block;
  width: min(100%, 280px);
  margin: 0.9rem auto 0;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.textPrimaryColor};
`;

const PlaylistIconBubble = styled.div`
  float: right;
  width: min(20%, 240px);
  aspect-ratio: 1 / 1;
  margin: 0 0 0.8rem 1rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.black};
  color: ${(props) => props.theme.textAccentColor};
`;

const PlaylistIcon = styled(PlaylistPlay)`
  width: 70%;
  height: auto;
`;

const ButtonRow = styled.div`
  clear: both;
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
`;

const BottomButtonRow = styled(ButtonRow)`
  margin-top: auto;
  padding-top: 1.25rem;
`;

export const HelpPage: React.FC = () => {
  return (
    <Container>
      <h2>Help</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator mb={0} />

        <HelpGrid>
          {/* Quick tips card */}
          <HelpCard flex="auto">
            <CardTitle>Quick tips</CardTitle>
            <TipsList>
              <li>Use AirPlay to connect your laptop to a TV without cables.</li>
              <li>
                In the settings of the app, increase the disk cache to get a
                better experience.
              </li>
            </TipsList>
            <CardText>
              See the{" "}
              <Anchor target="_blank" rel="noreferrer" href={DOCS_URLS.userManual}>
                Users&apos; Manual
              </Anchor>{" "}
              for explanation of the app and website, the{" "}
              <Anchor target="_blank" rel="noreferrer" href={DOCS_URLS.creatorsGuide}>
                Creators&apos; Guide
              </Anchor>{" "}
              for how to make your own dreams, and the{" "}
              <Anchor target="_blank" rel="noreferrer" href={DOCS_URLS.pythonAPI}>
                Python API
              </Anchor>{" "}
              for how to connect your own code. Or watch the following
              installation and basic usage walkthrough:
            </CardText>
          </HelpCard>

          {/* Video card */}
          <HelpCard flex="auto">
            <CardTitle>Installation and basic usage</CardTitle>
            <VideoFrame
              src={HELP_VIDEO_URL}
              title="infinidream installation and basic usage walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </HelpCard>

          {/* Remote control card */}
          <HelpCard flex="auto">
            <CardTitle>Remote control</CardTitle>
            <CardText>
              Use the A and D keys to adjust the speed of playback. Press F1
              to see more keyboard controls. You can also interact with the
              remote control installed on your phone, or from a web browser:
              <RemoteImage
                src="/images/rc.webp"
                alt="Remote control screenshot"
                loading="lazy"
              />
            </CardText>
            <ButtonRow>
              <Button
                buttonType="secondary"
                onClick={() => router.navigate(ROUTES.REMOTE_CONTROL)}
              >
                Open Remote
              </Button>
            </ButtonRow>
          </HelpCard>

          {/* Playlist browser card */}
          <HelpCard flex="auto">
            <CardTitle>Playlist browser</CardTitle>
            <CardText>
              <PlaylistIconBubble>
                <PlaylistIcon />
              </PlaylistIconBubble>
              Change your dreams by selecting a playlist from the browser.
              Click the button on a thumbnail to start that playlist.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() => router.navigate(ROUTES.PLAYLISTS)}
              >
                Open playlist browser
              </Button>
            </BottomButtonRow>
          </HelpCard>
        </HelpGrid>
      </Section>
    </Container>
  );
};

export default HelpPage;
