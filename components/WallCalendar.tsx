"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

export function generateCalendarDays(month: number, year: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Convert JS day index to Monday-based index: Mon=0 ... Sun=6
  const mondayFirstStartIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const calendarDays: CalendarDay[] = [];

  for (let i = mondayFirstStartIndex; i > 0; i -= 1) {
    calendarDays.push({
      date: new Date(year, month, 1 - i),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day += 1) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    });
  }

  return calendarDays;
}

const NOTES_STORAGE_KEY = "callypro:notesByRange";

function toISODateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildRangeKey(start: Date, end: Date) {
  return `${toISODateKey(start)}_to_${toISODateKey(end)}`;
}

function safeReadNotesMap(): Record<string, string> {
  if (globalThis.window === undefined) return {};
  const raw = globalThis.window.localStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function safeWriteNotesMap(map: Record<string, string>) {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(map));
}

export default function WallCalendar() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notesText, setNotesText] = useState("");
  const lastLoadedKeyRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const imageOverlayMonth = now
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const calendarDays = generateCalendarDays(currentMonth, currentYear);

  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isSameDate = (a: Date | null, b: Date | null) =>
    Boolean(a && b && normalizeDate(a).getTime() === normalizeDate(b).getTime());

  const handleDateClick = (clickedDate: Date) => {
    const normalizedClickedDate = normalizeDate(clickedDate);

    if (!startDate) {
      setStartDate(normalizedClickedDate);
      setEndDate(null);
      return;
    }

    if (!endDate) {
      if (isSameDate(startDate, normalizedClickedDate)) {
        setStartDate(normalizedClickedDate);
        setEndDate(normalizedClickedDate);
        return;
      }

      if (normalizedClickedDate < normalizeDate(startDate)) {
        setStartDate(normalizedClickedDate);
        setEndDate(normalizeDate(startDate));
        return;
      }

      setEndDate(normalizedClickedDate);
      return;
    }

    setStartDate(normalizedClickedDate);
    setEndDate(null);
  };

  const activeRange = useMemo(() => {
    if (!startDate && !endDate) return null;
    const normalizedStart = startDate ? normalizeDate(startDate) : null;
    const normalizedEnd = endDate ? normalizeDate(endDate) : null;

    if (normalizedStart && normalizedEnd) return { start: normalizedStart, end: normalizedEnd };
    if (normalizedStart) return { start: normalizedStart, end: normalizedStart };
    if (normalizedEnd) return { start: normalizedEnd, end: normalizedEnd };
    return null;
  }, [startDate, endDate]);

  const activeRangeKey = useMemo(() => {
    if (!activeRange) return null;
    return buildRangeKey(activeRange.start, activeRange.end);
  }, [activeRange]);

  const activeRangeLabel = useMemo(() => {
    if (!activeRange) return null;
    const startLabel = activeRange.start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endLabel = activeRange.end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }, [activeRange]);

  const saveNotesForActiveRange = () => {
    if (!activeRangeKey) return;
    const map = safeReadNotesMap();
    const trimmed = notesText.trim();
    if (!trimmed) {
      delete map[activeRangeKey];
      safeWriteNotesMap(map);
      return;
    }
    map[activeRangeKey] = notesText;
    safeWriteNotesMap(map);
  };

  useEffect(() => {
    if (!activeRangeKey) {
      lastLoadedKeyRef.current = null;
      setNotesText("");
      return;
    }

    if (lastLoadedKeyRef.current === activeRangeKey) return;
    const map = safeReadNotesMap();
    setNotesText(map[activeRangeKey] ?? "");
    lastLoadedKeyRef.current = activeRangeKey;
  }, [activeRangeKey]);

  useEffect(() => {
    if (!activeRangeKey) return;

    if (saveTimerRef.current) globalThis.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = globalThis.setTimeout(() => {
      saveNotesForActiveRange();
    }, 500);

    return () => {
      if (saveTimerRef.current) globalThis.clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesText, activeRangeKey]);

  return (
    <section className="relative mx-auto w-full max-w-6xl rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_12px_26px_rgba(0,0,0,0.08)] sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -top-3 left-8 h-6 w-16 rounded-full border border-neutral-300 bg-neutral-100 shadow-sm" />
      <div className="pointer-events-none absolute -top-3 right-8 h-6 w-16 rounded-full border border-neutral-300 bg-neutral-100 shadow-sm" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
        <div className="relative min-h-64 overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_6px_18px_rgba(0,0,0,0.1)] sm:min-h-80 lg:min-h-full">
          <Image
            src="/hero-placeholder.svg"
            alt="Calendar hero placeholder"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rotate-12 bg-white/20" />
          <div className="pointer-events-none absolute -top-20 right-14 h-52 w-52 rotate-45 border border-white/30 bg-white/10" />
          <div className="absolute bottom-5 left-5 rounded-md bg-black/35 px-3 py-2 backdrop-blur-[1px]">
            <p className="text-xs font-medium tracking-[0.2em] text-white/85">WALL CALENDAR</p>
            <p className="text-lg font-semibold tracking-wide text-white sm:text-xl">{imageOverlayMonth}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] sm:p-5">
          <header className="mb-4 border-b border-neutral-200 pb-3">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              {monthYear}
            </h1>
          </header>

          <div className="grid gap-5 md:grid-cols-[1fr_220px] md:gap-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:p-4">
              <div className="mb-3 grid grid-cols-7 gap-2 sm:gap-3">
                {weekdayLabels.map((label, weekdayIndex) => (
                  <div
                    key={label}
                    className={[
                      "text-center text-xs font-medium uppercase tracking-wide",
                      weekdayIndex >= 5 ? "text-neutral-400" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {calendarDays.map(({ date, isCurrentMonth }) => {
                  const normalizedDate = normalizeDate(date);
                  const isToday =
                    date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isStartDate = isSameDate(startDate, normalizedDate);
                  const isEndDate = isSameDate(endDate, normalizedDate);
                  const hasRange = Boolean(startDate && endDate);
                  const isInRange = Boolean(
                    hasRange &&
                      startDate &&
                      endDate &&
                      normalizedDate > normalizeDate(startDate) &&
                      normalizedDate < normalizeDate(endDate),
                  );

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      className={[
                        "aspect-square min-h-[44px] rounded-md border text-base transition-colors duration-150 md:min-h-0 md:text-sm",
                        isStartDate || isEndDate
                          ? "border-blue-600 bg-blue-500 font-semibold text-white"
                          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                        isInRange ? "border-blue-100 bg-blue-50 text-blue-800" : "",
                        isWeekend && !isToday && !isInRange && !isStartDate && !isEndDate
                          ? "bg-neutral-50/70"
                          : "",
                        isToday && !isStartDate && !isEndDate
                          ? "border-blue-400 font-semibold text-blue-700"
                          : "",
                        !isCurrentMonth && !isToday && !isStartDate && !isEndDate && !isInRange
                          ? "text-neutral-400"
                          : "",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-lg border border-neutral-200 bg-white p-3 sm:p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
                    Notes
                  </h2>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {activeRangeLabel ? (
                      <>
                        For <span className="font-medium text-neutral-700">{activeRangeLabel}</span>
                      </>
                    ) : (
                      "Select a date or range to add notes."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveNotesForActiveRange}
                  disabled={!activeRangeKey}
                  className={[
                    "h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-colors",
                    activeRangeKey
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "cursor-not-allowed bg-neutral-100 text-neutral-400",
                  ].join(" ")}
                >
                  Save
                </button>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                disabled={!activeRangeKey}
                className={[
                  "min-h-40 w-full resize-none rounded-md border p-2 text-sm outline-none transition-shadow placeholder:text-neutral-400 sm:min-h-44",
                  activeRangeKey
                    ? "border-neutral-200 bg-neutral-50 text-neutral-700 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
                    : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500",
                ].join(" ")}
                placeholder={
                  activeRangeKey ? "Write reminders, tasks, or ideas..." : "Select a date or range first."
                }
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
