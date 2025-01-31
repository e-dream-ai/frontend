import { useState } from "react";
import { useUser } from "@/api/user/query/useUser";
import { Column, Row } from "@/components/shared";
import { Avatar } from "@/components/shared/avatar/avatar";
import Container from "@/components/shared/container/container";
import { NotFound } from "@/components/shared/not-found/not-found";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import UserDreams from "@/components/shared/user-dreams/user-dreams";
import { getUserFeedFilterData, USER_FEED_TYPES } from "@/constants/feed.constants";
import { useImage } from "@/hooks/useImage";
import { getUserNameOrEmail } from "@/utils/user.util";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { UserFeedType } from "@/types/feed.types";
import UserVotedDreams from "@/components/shared/user-dreams/user-voted-dreams";
import { VoteType } from "@/types/vote.types";

const SECTION_ID = "user-feed";

export const UserFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid: userUUID } = useParams<{ uuid: string }>();

  const [radioGroupState, setRadioGroupState] = useState<UserFeedType>(USER_FEED_TYPES.ALL);

  const {
    data,
    isError,
    isLoading: isUserLoading,
  } = useUser({ uuid: userUUID });
  const user = data?.data?.user;

  const avatarUrl = useImage(user?.avatar, {
    width: 142,
    fit: "cover",
  });

  const handleRadioButtonGroupChange = (value?: string) => {
    setRadioGroupState(value as UserFeedType);
  };

  if (isUserLoading) {
    return (
      <Container>
        <Row justifyContent="center">
          <Spinner />
        </Row>
      </Container>
    );
  }

  if (isError) {
    return <NotFound />;
  }

  return (
    <Container>
      <Row m="0">
        <Column mr="3">
          <Avatar size="sm" url={avatarUrl} />
        </Column>
        <h2>
          {getUserNameOrEmail(user)}{"'s "}
          {t("page.user_feed.title")}
        </h2>
      </Row>
      <Section id={SECTION_ID}>
        <Row m="0">
          <RadioButtonGroup
            name="feed-filter"
            value={radioGroupState as string}
            data={getUserFeedFilterData(t)}
            onChange={handleRadioButtonGroupChange}
          />
        </Row>
        {
          [USER_FEED_TYPES.ALL, USER_FEED_TYPES.DREAM, USER_FEED_TYPES.PLAYLIST].includes(radioGroupState)
            ? <UserDreams
              grid
              columns={3}
              userUUID={user?.uuid}
              type={radioGroupState as string}
            />
            : <UserVotedDreams
              grid
              columns={3}
              userUUID={user?.uuid}
              type={radioGroupState as VoteType}
            />
        }
      </Section>
    </Container>
  );
};

export default UserFeedPage;
