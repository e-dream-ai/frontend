import {
  Decoration,
  DecorationSet,
  EditorView,
  Extension,
  ViewPlugin,
  ViewUpdate,
} from "@uiw/react-codemirror";
import {
  findPromptUuidLinks,
  PromptLinkTarget,
  PromptUuidLink,
} from "@/utils/prompt-links.util";

export const PROMPT_UUID_LINK_CLASS = "cm-prompt-uuid-link";

const LINK_SELECTOR = `a.${PROMPT_UUID_LINK_CLASS}`;

export interface PromptUuidLinkOptions {
  titles: Record<PromptLinkTarget, string>;
  onFollow: (href: string) => void;
  interactive: boolean;
}

const buildDecorations = (
  doc: string,
  titles: Record<PromptLinkTarget, string>,
): DecorationSet =>
  Decoration.set(
    findPromptUuidLinks(doc).map((link: PromptUuidLink) =>
      Decoration.mark({
        tagName: "a",
        class: PROMPT_UUID_LINK_CLASS,
        attributes: {
          href: link.href,
          title: titles[link.target],
          draggable: "false",
        },
      }).range(link.from, link.to),
    ),
    true,
  );

const hrefFromEvent = (event: MouseEvent): string | null => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest(LINK_SELECTOR)?.getAttribute("href") ?? null;
};

const hasSelectionInEditor = (view: EditorView): boolean => {
  const selection = view.dom.ownerDocument.getSelection();
  return Boolean(
    selection &&
      !selection.isCollapsed &&
      selection.anchorNode &&
      view.dom.contains(selection.anchorNode),
  );
};

const handleClick = (
  event: MouseEvent,
  view: EditorView,
  options: PromptUuidLinkOptions,
): boolean => {
  if (event.button !== 0) {
    return false;
  }

  const href = hrefFromEvent(event);
  if (!href) {
    return false;
  }

  const openInNewTab = event.metaKey || event.ctrlKey;
  if (!openInNewTab && !options.interactive) {
    return false;
  }

  if (hasSelectionInEditor(view)) {
    event.preventDefault();
    return false;
  }

  if (openInNewTab) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    options.onFollow(href);
  }

  return true;
};

export const promptUuidLinks = (options: PromptUuidLinkOptions): Extension =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(
          view.state.doc.toString(),
          options.titles,
        );
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = buildDecorations(
            update.state.doc.toString(),
            options.titles,
          );
        }
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
      eventHandlers: {
        click: (event, view) => handleClick(event, view, options),
      },
    },
  );
