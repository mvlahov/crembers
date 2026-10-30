const TZ = "Europe/Zagreb";

export function shortTime(iso: string | Date): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toLocaleDateString("hr-HR", { timeZone: TZ }) === now.toLocaleDateString("hr-HR", { timeZone: TZ });
  return sameDay
    ? d.toLocaleTimeString("hr-HR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("hr-HR", { timeZone: TZ, day: "numeric", month: "numeric" });
}

export function fullTime(iso: string | Date): string {
  return new Date(iso).toLocaleString("hr-HR", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
