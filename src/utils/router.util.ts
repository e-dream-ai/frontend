// join paths fn
export const joinPaths = (paths: string[]) => {
  return (
    paths
      // remove leading and trailing slashes
      .map((path) => path?.replace(/^\/|\/$/g, ""))
      // remove empty segments
      .filter(Boolean)
      .join("/")
  );
};
