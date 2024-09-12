import { useMutation } from "@tanstack/react-query";
// import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { LogoutRequestValues } from "@/schemas/logout.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const LOGOUT_MUTATION_KEY = "logout";

const logout = async () => {
  return axiosClient.get(`/v2/auth/logout`).then((res) => {
    return res.data;
  });
};

export const useLogout = () => {
  return useMutation<ApiResponse<unknown>, Error, LogoutRequestValues>(logout, {
    mutationKey: [LOGOUT_MUTATION_KEY],
  });
};

export default useLogout;
