import { describe, it, expect } from "vitest";
import type { Dream } from "@/types/dream.types";
import { middleFilmstripUrl, formatRunTime } from "./transition-history.util";

const dream = (partial: Partial<Dream>) => partial as Dream;

describe("middleFilmstripUrl", () => {
  it("picks the middle frame of an odd-length filmstrip", () => {
    expect(
      middleFilmstripUrl(
        dream({
          filmstrip: [
            { frameNumber: 0, url: "a" },
            { frameNumber: 10, url: "b" },
            { frameNumber: 20, url: "c" },
          ],
        }),
      ),
    ).toBe("b");
  });

  it("picks the lower middle of an even-length filmstrip", () => {
    expect(
      middleFilmstripUrl(
        dream({
          filmstrip: [
            { frameNumber: 0, url: "a" },
            { frameNumber: 10, url: "b" },
            { frameNumber: 20, url: "c" },
            { frameNumber: 30, url: "d" },
          ],
        }),
      ),
    ).toBe("b");
  });

  it("orders by frame number rather than trusting array order", () => {
    expect(
      middleFilmstripUrl(
        dream({
          filmstrip: [
            { frameNumber: 20, url: "c" },
            { frameNumber: 0, url: "a" },
            { frameNumber: 10, url: "b" },
          ],
        }),
      ),
    ).toBe("b");
  });

  it("falls back to the poster thumbnail with no filmstrip", () => {
    expect(middleFilmstripUrl(dream({ thumbnail: "poster.jpg" }))).toBe(
      "poster.jpg",
    );
    expect(
      middleFilmstripUrl(dream({ filmstrip: [], thumbnail: "poster.jpg" })),
    ).toBe("poster.jpg");
  });

  it("returns undefined when there is nothing to show", () => {
    expect(middleFilmstripUrl(undefined)).toBeUndefined();
    expect(middleFilmstripUrl(dream({ thumbnail: "" }))).toBeUndefined();
  });
});

describe("formatRunTime", () => {
  const noon = new Date(2026, 7, 22, 12, 0, 0).getTime();

  it("shows only the clock time for a run from today", () => {
    const morning = new Date(2026, 7, 22, 9, 5, 0).getTime();
    const label = formatRunTime(morning, noon);
    expect(label).not.toMatch(/\d{1,2}\s*(Aug|August)|Aug/);
    expect(label).toMatch(/\d/);
  });

  it("carries the date for a run from another day", () => {
    const yesterday = new Date(2026, 7, 21, 9, 5, 0).getTime();
    expect(formatRunTime(yesterday, noon)).toMatch(/Aug/);
  });

  it("distinguishes the same clock time on different days", () => {
    const sameTimeYesterday = new Date(2026, 7, 21, 12, 0, 0).getTime();
    expect(formatRunTime(sameTimeYesterday, noon)).not.toBe(
      formatRunTime(noon, noon),
    );
  });
});
