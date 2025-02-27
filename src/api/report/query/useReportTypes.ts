import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { ReportType } from "@/types/report.types";

export const REPORTS_TYPES_QUERY_KEY = "getReportsTypes";

const getReportsTypes = () => {
  return async () =>
    axiosClient
      .get(`/v1/report/type`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useReportTypes = () => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ reportTypes: ReportType[] }>, Error>(
    [REPORTS_TYPES_QUERY_KEY],
    getReportsTypes(),
    {
      enabled: Boolean(user),
    },
  );
};
