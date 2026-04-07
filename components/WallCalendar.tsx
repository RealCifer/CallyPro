"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

type AccentTheme = {
  selected: string;
  range: string;
  today: string;
  saveButton: string;
  selectionBadge: string;
  inputFocus: string;
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

function getAccentTheme(month: number): AccentTheme {
  const seasonalThemes: AccentTheme[] = [
    {
      selected: "border-rose-600 bg-rose-500 font-semibold text-white",
      range: "border-rose-100 bg-rose-50 text-rose-800",
      today: "border-rose-400 font-semibold text-rose-700",
      saveButton: "bg-rose-600 text-white hover:bg-rose-500",
      selectionBadge: "border-rose-200 bg-rose-50 text-rose-700",
      inputFocus: "focus:border-rose-300 focus:ring-rose-200",
    },
    {
      selected: "border-amber-600 bg-amber-500 font-semibold text-white",
      range: "border-amber-100 bg-amber-50 text-amber-800",
      today: "border-amber-400 font-semibold text-amber-700",
      saveButton: "bg-amber-600 text-white hover:bg-amber-500",
      selectionBadge: "border-amber-200 bg-amber-50 text-amber-700",
      inputFocus: "focus:border-amber-300 focus:ring-amber-200",
    },
    {
      selected: "border-emerald-600 bg-emerald-500 font-semibold text-white",
      range: "border-emerald-100 bg-emerald-50 text-emerald-800",
      today: "border-emerald-400 font-semibold text-emerald-700",
      saveButton: "bg-emerald-600 text-white hover:bg-emerald-500",
      selectionBadge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      inputFocus: "focus:border-emerald-300 focus:ring-emerald-200",
    },
    {
      selected: "border-sky-600 bg-sky-500 font-semibold text-white",
      range: "border-sky-100 bg-sky-50 text-sky-800",
      today: "border-sky-400 font-semibold text-sky-700",
      saveButton: "bg-sky-600 text-white hover:bg-sky-500",
      selectionBadge: "border-sky-200 bg-sky-50 text-sky-700",
      inputFocus: "focus:border-sky-300 focus:ring-sky-200",
    },
  ];

  return seasonalThemes[month % seasonalThemes.length];
}

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
  const [displayedDate, setDisplayedDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [isMonthAnimating, setIsMonthAnimating] = useState(false);
  const [monthSlideDirection, setMonthSlideDirection] = useState<1 | -1>(1);
  const [flipAnimationEnabled, setFlipAnimationEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notesText, setNotesText] = useState("");
  const lastLoadedKeyRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const displayedMonth = displayedDate.getMonth();
  const displayedYear = displayedDate.getFullYear();
  const accentTheme = getAccentTheme(displayedMonth);
  const monthYear = displayedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const imageOverlayMonth = displayedDate
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const calendarDays = generateCalendarDays(displayedMonth, displayedYear);

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

  const handleMonthChange = (direction: 1 | -1) => {
    if (isMonthAnimating) return;
    setMonthSlideDirection(direction);
    setIsMonthAnimating(true);
    globalThis.setTimeout(() => {
      setDisplayedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
      setIsMonthAnimating(false);
    }, 150);
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

  let monthAnimationClass = "translate-x-0 opacity-100";
  if (isMonthAnimating) {
    monthAnimationClass = monthSlideDirection === 1 ? "translate-x-1 opacity-30" : "-translate-x-1 opacity-30";
  }
  const shouldFlipAnimate = flipAnimationEnabled && !prefersReducedMotion;
  const flipAnimationClass =
    shouldFlipAnimate && isMonthAnimating
      ? "[transform:perspective(1000px)_rotateX(8deg)]"
      : "[transform:perspective(1000px)_rotateX(0deg)]";

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

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const mediaQuery = globalThis.window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreferenceChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    onMotionPreferenceChange();
    mediaQuery.addEventListener("change", onMotionPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onMotionPreferenceChange);
  }, []);

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
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                {monthYear}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFlipAnimationEnabled((prev) => !prev)}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden",
                    prefersReducedMotion ? "opacity-60" : "",
                  ].join(" ")}
                  aria-label={flipAnimationEnabled ? "Disable flip animation" : "Enable flip animation"}
                  title={flipAnimationEnabled ? "Flip on" : "Flip off"}
                >
                  {flipAnimationEnabled ? "F" : "f"}
                </button>
                <button
                  type="button"
                  onClick={() => setFlipAnimationEnabled((prev) => !prev)}
                  className={[
                    "hidden h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 md:inline-flex md:items-center",
                    prefersReducedMotion ? "opacity-60" : "",
                  ].join(" ")}
                >
                  Flip: {flipAnimationEnabled ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  disabled={isMonthAnimating}
                  className="h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous month"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  disabled={isMonthAnimating}
                  className="h-9 w-9 rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next month"
                >
                  {">"}
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 md:grid-cols-[1fr_220px] md:gap-4">
            <div
              className={[
                "rounded-lg border border-neutral-200 bg-white p-3 transition-all duration-200 will-change-transform sm:p-4",
                monthAnimationClass,
                flipAnimationClass,
              ].join(" ")}
            >
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
                        "relative aspect-square min-h-[44px] rounded-md border text-base transition duration-150 md:min-h-0 md:text-sm",
                        prefersReducedMotion ? "" : "hover:scale-[1.03] active:scale-[0.98]",
                        isStartDate || isEndDate
                          ? accentTheme.selected
                          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                        isInRange ? accentTheme.range : "",
                        isWeekend && !isToday && !isInRange && !isStartDate && !isEndDate
                          ? "border-dashed bg-neutral-50/80"
                          : "",
                        isToday && !isStartDate && !isEndDate
                          ? accentTheme.today
                          : "",
                        !isCurrentMonth && !isToday && !isStartDate && !isEndDate && !isInRange
                          ? "text-neutral-400"
                          : "",
                      ].join(" ")}
                    >
                      {isWeekend && isCurrentMonth && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-neutral-300" />
                      )}
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
                      <span
                        className={[
                          "inline-flex rounded-md border px-1.5 py-0.5 font-medium",
                          accentTheme.selectionBadge,
                        ].join(" ")}
                      >
                        {activeRangeLabel}
                      </span>
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
                      ? accentTheme.saveButton
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
                    ? `border-neutral-200 bg-neutral-50 text-neutral-700 focus:ring-2 ${accentTheme.inputFocus}`
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
