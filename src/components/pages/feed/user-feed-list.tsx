import { Row, Text } from "@/components/shared";
import { User } from "@/types/auth.types";
import { useTranslation } from "react-i18next";
import UserCard, { UserCardList } from "../user-card/user-card";

export const UserFeedList: React.FC<{ users?: User[] }> = ({ users }) => {
  const { t } = useTranslation();
  return (
    <>
      <Row separator pb="1rem" mb="1rem">
        {t("page.feed.users")}
      </Row>
      {users?.length ? (
        <UserCardList>
          {users?.map((user) => (
            <UserCard size="sm" key={user.id} user={user} />
          ))}
        </UserCardList>
      ) : (
        <Text mb={4}>{t("page.feed.empty_users")}</Text>
      )}
    </>
  );
};