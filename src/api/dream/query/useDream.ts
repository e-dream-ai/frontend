import { useQuery } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { getRequestHeaders } from "constants/auth.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const DREAM_QUERY_KEY = "getDream";

type QueryFunctionParams = {
  accessToken?: string;
  uuid?: string;
};

const getDream = ({ accessToken, uuid }: QueryFunctionParams) => {
  return async () =>
    fetch(`${URL}/dream/${uuid ?? ""}`, {
      headers: getRequestHeaders({ accessToken }),
    }).then((res) => res.json());
};

export const useDream = (uuid?: string) => {
  const { user } = useAuth();
  const accessToken = user?.token.AccessToken;
  return useQuery<ApiResponse<{ dream: Dream }>, Error>(
    [DREAM_QUERY_KEY],
    getDream({ accessToken, uuid }),
    { enabled: Boolean(user) || Boolean(uuid) },
  );
};
