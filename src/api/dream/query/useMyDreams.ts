import { useQuery } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { getRequestHeaders } from "constants/auth.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const DREAM_QUERY_KEY = "getDream";

type QueryFunctionParams = {
  accessToken?: string;
};

const getMyDreams = ({ accessToken }: QueryFunctionParams) => {
  return async () =>
    fetch(`${URL}/dream/my-dreams`, {
      headers: getRequestHeaders({ accessToken }),
    }).then((res) => res.json());
};

export const useMyDreams = (uuid?: string) => {
  const { user } = useAuth();
  const accessToken = user?.token.AccessToken;
  return useQuery<ApiResponse<{ dreams: Dream[] }>, Error>(
    [DREAM_QUERY_KEY, { uuid }],
    getMyDreams({ accessToken }),
    {
      enabled: Boolean(user),
    },
  );
};
