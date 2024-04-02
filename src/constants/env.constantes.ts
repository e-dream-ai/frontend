/**
 * "production" value remove dev dependencies, needed to build this project, so we use "prod" instead
 * https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-environment
 */
export const MODE = import.meta.env.MODE;
export const IS_PRODUCTION = import.meta.env.MODE === "prod";
export const IS_DEV = import.meta.env.MODE !== "development";
