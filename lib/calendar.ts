export type CalendarDay = { date: Date; isCurrentMonth: boolean };

export function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function sameDate(a: Date | null, b: Date | null): boolean {
  return Boolean(a && b && normalizeDate(a).getTime() === normalizeDate(b).getTime());
}

export function generateCalendarDays(month: number, year: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const mondayStart = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let i = mondayStart; i > 0; i -= 1) days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  for (let day = 1; day <= daysInMonth; day += 1) days.push({ date: new Date(year, month, day), isCurrentMonth: true });

  const remaining = (7 - (days.length % 7)) % 7;
  for (let day = 1; day <= remaining; day += 1) days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
  return days;
}

export function getNextSelection(
  start: Date | null,
  end: Date | null,
  clickedDate: Date,
): { start: Date | null; end: Date | null } {
  const clicked = normalizeDate(clickedDate);
  if (!start) return { start: clicked, end: null };
  if (!end) {
    if (sameDate(start, clicked)) return { start: clicked, end: clicked };
    if (clicked < normalizeDate(start)) return { start: clicked, end: normalizeDate(start) };
    return { start, end: clicked };
  }
  return { start: clicked, end: null };
}
