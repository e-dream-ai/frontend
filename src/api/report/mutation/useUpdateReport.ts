import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { UpdateReportRequestValues } from "@/schemas/update-report.schema";
import { ApiResponse } from "@/types/api.types";
import { Report } from "@/types/report.types";
import { axiosClient } from "@/client/axios.client";
import queryClient from "@/api/query-client";
import { REPORTS_QUERY_KEY } from "../query/useReports";

export const UPDATE_REPORT_MUTATION_KEY = "updateReport";

const updateReport = () => {
  return async (data: UpdateReportRequestValues) => {
    const { uuid, values } = data;
    return axiosClient
      .put(`/v1/report/${uuid}`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateReport = () => {
  return useMutation<
    ApiResponse<{ report: Report }>,
    Error,
    UpdateReportRequestValues
  >(updateReport(), {
    mutationKey: [UPDATE_REPORT_MUTATION_KEY],
    onSuccess: () => {
      // Invalidate and refetch the 'reports' query
      queryClient.invalidateQueries([REPORTS_QUERY_KEY]);
    },
  });
};
