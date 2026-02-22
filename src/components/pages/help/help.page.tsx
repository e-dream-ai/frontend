import { Anchor, Button, Row } from "@/components/shared";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { ROUTES } from "@/constants/routes.constants";
import Play from "@/icons/play";
import PlaylistPlay from "@/icons/playlist-play";
import router from "@/routes/router";
import styled from "styled-components";

const SECTION_ID = "help";
const HELP_VIDEO_URL =
  "https://www.youtube.com/embed/yHrwo4asw4Y?si=SFBEZNR6_ECSxfgb";

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
  font-size: 1.4rem !important;
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
  width: 100%;
  margin: 0.9rem auto 0;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.textPrimaryColor};
`;

const InlineImage = styled.img`
  float: right;
  clear: right;
  width: 80px;
  height: auto;
  margin: 0.2rem 0 0.4rem 0.8rem;
  border-radius: 6px;
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

const PlayIconBubble = styled(PlaylistIconBubble)``;

const PlayIcon = styled(Play)`
  width: 50%;
  height: auto;
`;

const ElectricSheepLogo = styled(PlaylistIconBubble)`
  overflow: hidden;
`;

const ElectricSheepLogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
          <HelpCard flex="auto">
            <CardTitle>Install</CardTitle>
            <CardText>
              Download and install the Infinidream native app to start dreaming
              on your screen. The install page has everything you need to get
              set up.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() => router.navigate(ROUTES.INSTALL)}
              >
                Go to Install
              </Button>
            </BottomButtonRow>
          </HelpCard>

          <HelpCard flex="auto">
            <CardTitle>Connect</CardTitle>
            <CardText>
              The Infinidream app connects to your account through the cloud,
              and is best controlled from a web browser or your phone.
            </CardText>
            <CardText>
              <InlineImage
                src="/images/avatar-gray.webp"
                alt="Avatar with gray indicator"
                loading="lazy"
              />
              <InlineImage
                src="/images/avatar-green.webp"
                alt="Avatar with green indicator"
                loading="lazy"
              />
              A the top-right corner of the screen, there is a circular colored
              indicator next to your avatar that shows if this remote control is
              connected. Gray means no screen is connected. Green means the
              remote is connected to a screen.
            </CardText>
          </HelpCard>

          <HelpCard flex="auto">
            <CardTitle>Remote control</CardTitle>
            <CardText>
              When you are connected, the remote control appears in a tray at
              the bottom of the screen. The current dream's thumbnail, title,
              artist, timecode, and speed in FPS of playback are all shown.
              <RemoteImage
                src="/images/thumb-title-artist.webp"
                alt="Thumbnail, title, artist, and timecode"
                loading="lazy"
              />
            </CardText>
          </HelpCard>

          <HelpCard flex="auto">
            <CardTitle>Remote control</CardTitle>
            <CardText>
              The second row has buttons in the four directions: previous, next,
              like, and dislike. Anything you dislike will never be shone again.
              And likes help learning to generate better dreams. And in the
              middle are toggles: CC for showing the credits, repeat mode, and
              shuffle mode. On the right are turtle for slower and rabbit for
              faster.
              <RemoteImage
                src="/images/rc.webp"
                alt="Remote control screenshot"
                loading="lazy"
              />
            </CardText>
          </HelpCard>

          <HelpCard flex="auto">
            <CardTitle>Remote control</CardTitle>
            <CardText>
              The main remote page has same the controls as the tray, and also
              an array of buttons with more controls. And it shows the current
              playlist as well.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() => router.navigate(ROUTES.REMOTE_CONTROL)}
              >
                Open Remote
              </Button>
            </BottomButtonRow>
          </HelpCard>

          {/* Playlist browser card */}
          <HelpCard flex="auto">
            <CardTitle>Playlists and Dreams</CardTitle>
            <CardText>
              <PlaylistIconBubble>
                <PlaylistIcon />
              </PlaylistIconBubble>
              Change your dreams by selecting a playlist from the browser. Click
              the button on a thumbnail to start that playlist, which will
              continue to play infinitely.
            </CardText>
            <CardText>
              <PlayIconBubble>
                <PlayIcon />
              </PlayIconBubble>
              Playlists are made of many dreams, and you can also play an
              individual dream with a similar triangular button on its
              thumbnail. Once that dream is finished, it will return to the
              playlist.
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

          {/* Keyboard control card */}
          <HelpCard flex="auto">
            <CardTitle>Keyboard control</CardTitle>
            <CardText>
              The app can be controlled with the keyboard, pointer, and menus.
            </CardText>
            <CardText>
              Use the A and D keys to slow down or speed up playback. The left
              and right arrow keys skip to the previous or next dream in the
              playlist.
            </CardText>
            <CardText>
              The up and down arrow keys are to like and dislike the current
              dream. Anything you dislike will never be shone again. And likes
              help learning to generate better dreams.
            </CardText>
            <CardText>
              Press F1 to see all available keyboard commands, in the help
              overlay.
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

          {/* Quick tips card */}
          <HelpCard flex="auto">
            <CardTitle>Quick tips</CardTitle>
            <TipsList>
              <li>
                Use AirPlay to connect your laptop to a TV without cables, but
                use an HDMI to optimize quality.
              </li>
              <li>
                In the settings of the app, increase the disk cache to get a
                better experience.
              </li>
              <li>
                Like and dislike liberally to personalize your experience.
              </li>
              <li>Use the B key to flag or report a problem with any dream.</li>
            </TipsList>
          </HelpCard>

          {/* Links card */}
          <HelpCard flex="auto">
            <CardTitle>Go Deeper</CardTitle>
            <TipsList>
              <li>
                See the{" "}
                <Anchor
                  target="_blank"
                  rel="noreferrer"
                  href="https://github.com/e-dream-ai/python-api"
                >
                  Python API
                </Anchor>{" "}
                for how to connect your own code, and even create your own
                infinite artworks.
              </li>
              <li>
                Apply to our{" "}
                <Anchor
                  target="_blank"
                  rel="noreferrer"
                  href="https://forms.gle/JsZb4TRdw3jq65Bc8"
                >
                  Creators Program
                </Anchor>{" "}
                to get access to uploading and GPU generation.
              </li>
              <li>
                Return to the{" "}
                <Anchor
                  target="_blank"
                  rel="noreferrer"
                  href="https://infinidream.ai/"
                >
                  landing page
                </Anchor>{" "}
                to learn more.
              </li>
            </TipsList>
          </HelpCard>

          {/* Web client card */}
          <HelpCard flex="auto">
            <CardTitle>Web player</CardTitle>
            <CardText>
              The native Infinidream app currently runs on macOS only. However,
              we have a prototype web client that runs in any modern web
              browser. Just click the button below to try it out, no
              installation required.
            </CardText>
            <CardText>
              The web player can show all the dreams at full resolution, but it
              streams instead of using local storage, and it does not provide
              the same smooth speed controls, exact concatenation, or looping of
              dreams.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() =>
                  router.navigate(`${ROUTES.REMOTE_CONTROL}?autoplay=1`)
                }
              >
                Start web player
              </Button>
            </BottomButtonRow>
          </HelpCard>

          {/* Creating playlists card */}
          <HelpCard flex="auto">
            <CardTitle>Creating playlists</CardTitle>
            <CardText>
              Create your own playlist by clicking the button below. Give it a
              name and it will appear in your collection.
            </CardText>
            <CardText>
              Then browse dreams and playlists and use the "+" button in the
              top-right of any dream or playlist page to add it to your
              playlist. You can add individual dreams or entire playlists to
              build your own custom mix.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() =>
                  window.open(
                    "https://alpha.infinidream.ai/create/playlist",
                    "_blank",
                  )
                }
              >
                Create a playlist
              </Button>
            </BottomButtonRow>
          </HelpCard>

          {/* Electric Sheep card */}
          <HelpCard flex="auto">
            <CardTitle>Electric Sheep</CardTitle>
            <CardText>
              <ElectricSheepLogo>
                <ElectricSheepLogoImg
                  src="/images/electric-sheep-logo.png"
                  alt="Electric Sheep logo"
                  loading="lazy"
                />
              </ElectricSheepLogo>
              Electric Sheep are an ancestor of the Infinidream platform. These
              classic crowdsource fractal flame animations live on inside of
              Infinidream for everyone to enjoy. The Electric Sheep continue to
              evolve, now in 1080p and higher quality than ever.
            </CardText>
            <CardText>
              There are multiple playlists with different styles of Sheep:
              Wanderlust, Meditations, Singularities, and more.
            </CardText>
            <BottomButtonRow>
              <Button
                buttonType="secondary"
                onClick={() =>
                  router.navigate(
                    `${ROUTES.VIEW_PLAYLIST}/13489b20-cc0b-4923-8ea8-3f64015fe389`,
                  )
                }
              >
                Electric sheep playlist
              </Button>
            </BottomButtonRow>
          </HelpCard>
        </HelpGrid>
      </Section>
    </Container>
  );
};

export default HelpPage;
