import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { PAGINATION } from "constants/pagination.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const MY_DREAMS_QUERY_KEY = "getMyDreams";

type QueryFunctionParams = {
  accessToken?: string;
} & HookParams;

const getMyDreams = ({ accessToken, take, skip }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/dream/my-dreams`, {
        params: {
          take,
          skip,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  take?: number;
  skip?: number;
};

export const useMyDreams = (
  { take, skip }: HookParams = { take: PAGINATION.TAKE, skip: 0 },
) => {
  const { user } = useAuth();
  const accessToken = user?.token?.AccessToken;
  return useQuery<ApiResponse<{ dreams: Dream[]; count: number }>, Error>(
    [MY_DREAMS_QUERY_KEY],
    getMyDreams({ accessToken, take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
