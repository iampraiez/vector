/** Time portion for tracking / order timestamps (locale). */
export function formatTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Relative "Xs ago" for last-updated labels (uses `Date.now()`). */
export function formatLastUpdatedAgo(updatedAt: Date): string {
  const sec = Math.max(
    0,
    Math.floor((Date.now() - updatedAt.getTime()) / 1000),
  );
  if (sec < 60) return `${sec} second${sec === 1 ? "" : "s"} ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
