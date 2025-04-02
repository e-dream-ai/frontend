import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";

export const USER_DISLIKES_QUERY_KEY = "getUserDislikes";

type UserDislikesResponse = { dislikes: string[] };

export const useUserDislikes = () => {
  return useApiQuery<UserDislikesResponse>(
    [USER_DISLIKES_QUERY_KEY],
    `/v1/user/current/dislikes`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {},
  );
};
