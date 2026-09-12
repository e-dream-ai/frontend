import { ROUTES } from "@/constants/routes.constants";
import { isUuid } from "@/utils/string.util";

export type PromptLinkTarget = "dream" | "playlist" | "keyframe";

export interface PromptUuidLink {
  from: number;
  to: number;
  uuid: string;
  target: PromptLinkTarget;
  key: string;
  href: string;
}

const TARGET_MATCHERS: ReadonlyArray<{
  pattern: RegExp;
  target: PromptLinkTarget;
}> = [
  { pattern: /playlist/i, target: "playlist" },
  { pattern: /keyframe/i, target: "keyframe" },
  { pattern: /dream|video|clip|frame|image|source|parent/i, target: "dream" },
];

const ROUTE_BY_TARGET: Record<PromptLinkTarget, string> = {
  dream: ROUTES.VIEW_DREAM,
  playlist: ROUTES.VIEW_PLAYLIST,
  keyframe: ROUTES.VIEW_KEYFRAME,
};

export const inferPromptLinkTarget = (key: string): PromptLinkTarget | null =>
  TARGET_MATCHERS.find(({ pattern }) => pattern.test(key))?.target ?? null;

export const buildPromptLinkHref = (
  target: PromptLinkTarget,
  uuid: string,
): string => `${ROUTE_BY_TARGET[target]}/${uuid}`;

export const findPromptUuidLinks = (doc: string): PromptUuidLink[] => {
  const stringLiterals = /"((?:[^"\\]|\\.)*)"(\s*:)?/g;
  const links: PromptUuidLink[] = [];
  let key: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = stringLiterals.exec(doc)) !== null) {
    const [, content, colon] = match;
    const uuid = content.trim();

    if (isUuid(uuid)) {
      const target = key ? inferPromptLinkTarget(key) : null;
      if (key && target) {
        const from = match.index + 1 + content.indexOf(uuid);
        links.push({
          from,
          to: from + uuid.length,
          uuid,
          target,
          key,
          href: buildPromptLinkHref(target, uuid),
        });
      }
      continue;
    }

    if (colon) {
      key = content;
    }
  }

  return links;
};
