import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { LogoutRequestValues } from "schemas/logout.schema";
import { ApiResponse } from "types/api.types";

export const LOGOUT_MUTATION_KEY = "logout";

const logout = async (params: LogoutRequestValues) => {
  return fetch(`${URL}/auth/logout`, {
    method: "post",
    body: JSON.stringify(params),
    headers: getRequestHeaders({
      contentType: ContentType.json,
    }),
  }).then((res) => {
    return res.json();
  });
};

export const useLogout = () => {
  return useMutation<ApiResponse<unknown>, Error, LogoutRequestValues>(logout, {
    mutationKey: [LOGOUT_MUTATION_KEY],
  });
};

export default useLogout;
