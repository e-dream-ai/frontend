import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { CreateReportFormRequest } from "@/schemas/create-report.schema";
import { ApiResponse } from "@/types/api.types";
import { Report } from "@/types/report.types";
import { axiosClient } from "@/client/axios.client";

export const CREATE_REPORT_MUTATION_KEY = "createReport";

const createReport = () => {
  return async (params: CreateReportFormRequest) => {
    return axiosClient
      .post(`/v1/report`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreateReport = () => {
  return useMutation<
    ApiResponse<{ report: Report }>,
    Error,
    CreateReportFormRequest
  >(createReport(), {
    mutationKey: [CREATE_REPORT_MUTATION_KEY],
  });
};
