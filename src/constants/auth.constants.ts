export const AUTH_LOCAL_STORAGE_KEY = "user";

export const getRequestHeaders = ({
  accessToken,
  removeContentType,
}: {
  accessToken?: string;
  removeContentType?: boolean;
}) => ({
  "Content-type": removeContentType ? "" : "application/json; charset=UTF-8",
  Authorization: accessToken ? `Bearer ${accessToken}` : "",
  "Access-Control-Allow-Origin": "*",
});
