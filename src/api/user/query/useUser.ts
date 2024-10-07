import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { User } from "@/types/auth.types";
import useApiQuery from "@/api/shared/useApiQuery";

export const USER_QUERY_KEY = "getUser";

type HookParams = {
  uuid?: string;
};

type UserResponse = { user: User };

export const useUser = ({ uuid }: HookParams) => {
  return useApiQuery<UserResponse>(
    [USER_QUERY_KEY, uuid],
    `/v1/user/${uuid}`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {},
  );
};
