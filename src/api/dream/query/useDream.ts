import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";

export const DREAM_QUERY_KEY = "getDream";

type QueryFunctionParams = {
  uuid?: string;
};

const getDream = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/dream/${uuid ?? ""}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useDream = (uuid?: string) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ dream: Dream }>, Error>(
    [DREAM_QUERY_KEY, { uuid }],
    getDream({ uuid }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(uuid),
    },
  );
};
