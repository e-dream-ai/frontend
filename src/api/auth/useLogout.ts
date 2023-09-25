import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { LogoutRequestValues } from "schemas/logout.schema";
import { MutationResponse } from "types/api.types";

export const LOGOUT_MUTATION_KEY = "logout";

const logout = async (params: LogoutRequestValues) => {
  return fetch(`${URL}/auth/logout`, {
    method: "post",
    body: JSON.stringify(params),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then((res) => {
    if (!res.ok) {
      throw new Error();
    }
    return res.json();
  });
};

export const useLogout = () => {
  return useMutation<MutationResponse<unknown>, Error, LogoutRequestValues>(
    logout,
    {
      mutationKey: [LOGOUT_MUTATION_KEY],
    },
  );
};

export default useLogout;
