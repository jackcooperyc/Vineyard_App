export function isWithinQuietHours(
  quietHoursStart: number | null,
  quietHoursEnd: number | null,
  timezone: string,
  now = new Date(),
): boolean {
  if (quietHoursStart === null || quietHoursEnd === null) {
    return false;
  }
  if (quietHoursStart === quietHoursEnd) {
    return false;
  }

  const hour = getHourInTimezone(now, timezone);

  if (quietHoursStart < quietHoursEnd) {
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }

  return hour >= quietHoursStart || hour < quietHoursEnd;
}

function getHourInTimezone(date: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(date);
    const hourPart = parts.find((p) => p.type === "hour");
    return Number(hourPart?.value ?? date.getUTCHours());
  } catch {
    return date.getUTCHours();
  }
}
