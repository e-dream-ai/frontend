import { describe, expect, it } from "vitest";
import type { FeedItem, VirtualPlaylist } from "@/types/feed.types";
import { shouldAutoFetchGroupedFeed } from "./groupedFeed.helpers";

const page = (feedItems: number, virtualPlaylists: number) => ({
  success: true,
  data: {
    feedItems: Array.from({ length: feedItems }, () => ({}) as FeedItem),
    virtualPlaylists: Array.from(
      { length: virtualPlaylists },
      () => ({}) as VirtualPlaylist,
    ),
    count: 1000,
  },
});

const feed = (...pages: ReturnType<typeof page>[]) => ({
  pages,
  pageParams: pages.map((_, i) => i),
});

describe("shouldAutoFetchGroupedFeed", () => {
  it("does nothing before the first page loads", () => {
    expect(shouldAutoFetchGroupedFeed(undefined, true, 48)).toBe(false);
    expect(shouldAutoFetchGroupedFeed(feed(), true, 48)).toBe(false);
  });

  it("loads more when one big playlist leaves a single card", () => {
    expect(shouldAutoFetchGroupedFeed(feed(page(0, 1)), true, 48)).toBe(true);
  });

  it("loads more when the last page added no cards", () => {
    expect(
      shouldAutoFetchGroupedFeed(feed(page(80, 3), page(0, 0)), true, 48),
    ).toBe(true);
  });

  it("waits for a scroll once the list is long and the last page added cards", () => {
    expect(
      shouldAutoFetchGroupedFeed(feed(page(0, 1), page(60, 2)), true, 48),
    ).toBe(false);
  });

  it("ignores virtual playlists when the view does not show them", () => {
    expect(shouldAutoFetchGroupedFeed(feed(page(0, 5)), false, 1)).toBe(true);
    expect(shouldAutoFetchGroupedFeed(feed(page(0, 5)), true, 1)).toBe(false);
  });
});
