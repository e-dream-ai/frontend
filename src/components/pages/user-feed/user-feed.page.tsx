import { useEffect, useState } from "react";
import { useUser } from "@/api/user/query/useUser";
import { Row } from "@/components/shared";
import { Avatar } from "@/components/shared/avatar/avatar";
import Container from "@/components/shared/container/container";
import { NotFound } from "@/components/shared/not-found/not-found";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import SearchBar from "@/components/shared/search-bar/search-bar";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import UserDreams from "@/components/shared/user-dreams/user-dreams";
import { USER_FEED_TYPES } from "@/constants/feed.constants";
import { useDebounce } from "@/hooks/useDebounce";
import { useImage } from "@/hooks/useImage";
import { getUserNameOrEmail } from "@/utils/user.util";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { FeedItemFilterType, UserFeedType } from "@/types/feed.types";
import UserVotedDreams from "@/components/shared/user-dreams/user-voted-dreams";
import { VoteType } from "@/types/vote.types";
import { useUserFeedFilter } from "./useUserFeedFilter";

const SECTION_ID = "user-feed";

const USER_DREAMS_COMPONENT = [
  USER_FEED_TYPES.ALL,
  USER_FEED_TYPES.DREAM,
  USER_FEED_TYPES.PLAYLIST,
  USER_FEED_TYPES.STILLS,
  USER_FEED_TYPES.HIDDEN,
];

export const UserFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { uuid: userUUID } = useParams<{ uuid: string }>();
  const [radioGroupState, setRadioGroupState] = useState<UserFeedType>(
    USER_FEED_TYPES.ALL,
  );
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  const radioGroupData = useUserFeedFilter();

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

  const handleOnChange = (value?: string) => {
    if (!value && value !== "") return;
    setSearchValue(value);
  };

  const handleOnSearch = (value?: string) => {
    if (!value && value !== "") return;
    setSearch(value);
  };

  const handleOnClearSearch = () => {
    setSearchValue("");
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
      <Row
        m="0"
        justifyContent="space-between"
        alignItems="center"
        style={{ gap: "12px" }}
      >
        <Row m="0" alignItems="center" style={{ gap: "12px" }}>
          <Avatar size="sm" url={avatarUrl} />
          <h2 style={{ margin: 0 }}>
            {getUserNameOrEmail(user)}
            {"'s "}
            {t("page.user_feed.title")}
          </h2>
        </Row>
        <SearchBar
          showClearButton={Boolean(searchValue)}
          onChange={handleOnChange}
          onSearch={handleOnSearch}
          onClear={handleOnClearSearch}
        />
      </Row>
      <Section id={SECTION_ID}>
        <Row m="0">
          <RadioButtonGroup
            name="feed-filter"
            value={radioGroupState as string}
            data={radioGroupData}
            onChange={handleRadioButtonGroupChange}
          />
        </Row>
        {USER_DREAMS_COMPONENT.includes(radioGroupState) ? (
          <UserDreams
            grid
            columns={3}
            userUUID={user?.uuid}
            search={search}
            type={
              radioGroupState === USER_FEED_TYPES.STILLS
                ? "dream"
                : (radioGroupState as FeedItemFilterType)
            }
            mediaType={
              radioGroupState === USER_FEED_TYPES.STILLS
                ? "image"
                : radioGroupState === USER_FEED_TYPES.DREAM
                  ? "video"
                  : undefined
            }
          />
        ) : (
          <UserVotedDreams
            grid
            columns={3}
            userUUID={user?.uuid}
            search={search}
            type={radioGroupState as VoteType}
          />
        )}
      </Section>
    </Container>
  );
};

export default UserFeedPage;
