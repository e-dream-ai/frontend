import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Report } from "@/types/report.types";

export const REPORTS_QUERY_KEY = "getReports";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getReports = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/report`, {
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
  page?: number;
};

export const useReports = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ reports: Report[]; count: number }>, Error>(
    [REPORTS_QUERY_KEY, page],
    getReports({ take, skip }),
    {
      enabled: Boolean(user),
    },
  );
};
