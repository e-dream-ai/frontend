import type { Dream } from "@/types/dream.types";

/**
 * The filmstrip frame nearest the middle of the clip. The first frame of a
 * transition is (by construction) its start reference frame, so it looks the
 * same for every take at a position — the middle is where takes actually
 * differ, which is what makes the history strip worth looking at.
 *
 * Falls back to the dream's poster thumbnail while the filmstrip is missing.
 */
export function middleFilmstripUrl(dream?: Dream): string | undefined {
  const frames = dream?.filmstrip;
  if (frames && frames.length > 0) {
    const ordered = [...frames].sort((a, b) => a.frameNumber - b.frameNumber);
    return ordered[Math.floor((ordered.length - 1) / 2)]?.url;
  }
  return dream?.thumbnail || undefined;
}

/**
 * Short label identifying a take. Same-day runs — the common case while
 * iterating — show just the clock time; older ones carry the date so two takes
 * from different days can't read as the same moment.
 */
export function formatRunTime(createdAt: number, now: number = Date.now()) {
  const date = new Date(createdAt);
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date(now);
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) return time;
  const day = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${day} ${time}`;
}

/**
 * The clip's closing filmstrip frame: where an action clip has gone by its
 * end, which is how takes of the same image and action differ most. Falls back
 * to the poster thumbnail while the filmstrip is missing.
 */
export function lastFilmstripUrl(dream?: Dream): string | undefined {
  const frames = dream?.filmstrip;
  if (frames && frames.length > 0) {
    return frames.reduce((last, f) =>
      f.frameNumber > last.frameNumber ? f : last,
    ).url;
  }
  return dream?.thumbnail || undefined;
}
