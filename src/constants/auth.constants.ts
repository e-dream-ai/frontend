export const AUTH_LOCAL_STORAGE_KEY = "user";

export enum ContentType {
  json = "json",
  none = "none",
}

const CONTENT_TYPES = {
  [ContentType.json]: "application/json; charset=UTF-8",
  [ContentType.none]: "",
};

export const getRequestHeaders = ({
  accessToken,
  contentType = ContentType.none,
}: {
  accessToken?: string;
  contentType?: ContentType;
}) => {
  let contentTypeHeader = {};

  if (contentType !== ContentType.none) {
    contentTypeHeader = { "Content-type": CONTENT_TYPES[contentType] };
  }
  return {
    ...contentTypeHeader,
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    "Access-Control-Allow-Origin": "*",
  };
};
