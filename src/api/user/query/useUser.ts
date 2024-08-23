import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { User } from "@/types/auth.types";
import useApiQuery from "@/api/shared/useApiQuery";

export const USER_QUERY_KEY = "getUser";

type HookParams = {
  id?: string | number;
};

type UserResponse = { user: Omit<User, "token"> };

export const useUser = ({ id }: HookParams) => {
  return useApiQuery<UserResponse>(
    [USER_QUERY_KEY, id],
    `/user/${id}`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {},
  );
};
