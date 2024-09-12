export const AUTH_LOCAL_STORAGE_KEY = "user";

export enum ContentType {
  json = "json",
  multipart = "multipart",
  none = "none",
}

export const CONTENT_TYPES = {
  [ContentType.json]: "application/json; charset=UTF-8",
  [ContentType.multipart]: "multipart/form-data",
  [ContentType.none]: "",
};

export const getRequestHeaders = ({
  contentType = ContentType.none,
}: {
  contentType?: ContentType;
}) => {
  let contentTypeHeader = {};

  if (contentType !== ContentType.none) {
    contentTypeHeader = { "Content-type": CONTENT_TYPES[contentType] };
  }
  return {
    ...contentTypeHeader,
  };
};

export const SOCKET_AUTH_ERROR_MESSAGES = {
  UNAUTHORIZED: "UNAUTHORIZED",
};
