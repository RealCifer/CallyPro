 "use client";

import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { generateCalendarDays, getNextSelection, normalizeDate, sameDate } from "@/lib/calendar";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NOTES_STORAGE_KEY = "callypro:notesByRange";
const HOLIDAY_MAP: Record<string, string> = {
  "01-01": "New Year",
  "02-14": "Valentine's Day",
  "07-04": "Independence Day",
  "10-31": "Halloween",
  "12-25": "Christmas",
};

type DateRange = { start: Date; end: Date };
type AccentTheme = {
  selected: string;
  range: string;
  today: string;
  saveButton: string;
  selectionBadge: string;
  inputFocus: string;
};

function getAccentTheme(month: number): AccentTheme {
  const themes: AccentTheme[] = [
    { selected: "border-rose-600 bg-rose-500 font-semibold text-white", range: "border-rose-100 bg-rose-50 text-rose-800", today: "border-rose-400 font-semibold text-rose-700", saveButton: "bg-rose-600 text-white hover:bg-rose-500", selectionBadge: "border-rose-200 bg-rose-50 text-rose-700", inputFocus: "focus:border-rose-300 focus:ring-rose-200" },
    { selected: "border-amber-600 bg-amber-500 font-semibold text-white", range: "border-amber-100 bg-amber-50 text-amber-800", today: "border-amber-400 font-semibold text-amber-700", saveButton: "bg-amber-600 text-white hover:bg-amber-500", selectionBadge: "border-amber-200 bg-amber-50 text-amber-700", inputFocus: "focus:border-amber-300 focus:ring-amber-200" },
    { selected: "border-emerald-600 bg-emerald-500 font-semibold text-white", range: "border-emerald-100 bg-emerald-50 text-emerald-800", today: "border-emerald-400 font-semibold text-emerald-700", saveButton: "bg-emerald-600 text-white hover:bg-emerald-500", selectionBadge: "border-emerald-200 bg-emerald-50 text-emerald-700", inputFocus: "focus:border-emerald-300 focus:ring-emerald-200" },
    { selected: "border-sky-600 bg-sky-500 font-semibold text-white", range: "border-sky-100 bg-sky-50 text-sky-800", today: "border-sky-400 font-semibold text-sky-700", saveButton: "bg-sky-600 text-white hover:bg-sky-500", selectionBadge: "border-sky-200 bg-sky-50 text-sky-700", inputFocus: "focus:border-sky-300 focus:ring-sky-200" },
  ];
  return themes[month % themes.length];
}

function toISODateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODateKey(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function buildRangeKey(start: Date, end: Date): string {
  return `${toISODateKey(start)}_to_${toISODateKey(end)}`;
}

function parseMonthParam(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function getHolidayLabel(date: Date): string | null {
  const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return HOLIDAY_MAP[key] ?? null;
}

function safeReadNotesMap(): Record<string, string> {
  if (globalThis.window === undefined) return {};
  const raw = globalThis.window.localStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function safeWriteNotesMap(map: Record<string, string>) {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(map));
}

function buildDayAriaLabel(date: Date, holidayLabel: string | null): string {
  const base = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return holidayLabel ? `${base}, ${holidayLabel}` : base;
}

type WallCalendarProps = { darkMode?: boolean };

export default function WallCalendar({ darkMode = false }: WallCalendarProps) {
  const now = new Date();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saveTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [displayedDate, setDisplayedDate] = useState(() => {
    if (globalThis.window === undefined) return new Date(now.getFullYear(), now.getMonth(), 1);
    const fromUrl = parseMonthParam(new URLSearchParams(globalThis.window.location.search).get("month"));
    return fromUrl ?? new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [focusedDate, setFocusedDate] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const [isMonthAnimating, setIsMonthAnimating] = useState(false);
  const [monthSlideDirection, setMonthSlideDirection] = useState<1 | -1>(1);
  const [flipAnimationEnabled, setFlipAnimationEnabled] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (globalThis.window === undefined) return null;
    return parseISODateKey(new URLSearchParams(globalThis.window.location.search).get("start"));
  });
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (globalThis.window === undefined) return null;
    return parseISODateKey(new URLSearchParams(globalThis.window.location.search).get("end"));
  });
  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => safeReadNotesMap());
  const [toastMessage, setToastMessage] = useState("");

  const displayedMonth = displayedDate.getMonth();
  const displayedYear = displayedDate.getFullYear();
  const accentTheme = getAccentTheme(displayedMonth);
  const monthYear = displayedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const imageOverlayMonth = displayedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  const calendarDays = useMemo(() => generateCalendarDays(displayedMonth, displayedYear), [displayedMonth, displayedYear]);

  const activeRange = useMemo<DateRange | null>(() => {
    if (!startDate && !endDate) return null;
    const s = startDate ? normalizeDate(startDate) : null;
    const e = endDate ? normalizeDate(endDate) : null;
    if (s && e) return { start: s, end: e };
    if (s) return { start: s, end: s };
    if (e) return { start: e, end: e };
    return null;
  }, [startDate, endDate]);

  const activeRangeKey = useMemo(() => (activeRange ? buildRangeKey(activeRange.start, activeRange.end) : null), [activeRange]);
  const activeRangeLabel = useMemo(() => {
    if (!activeRange) return null;
    const s = activeRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const e = activeRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return s === e ? s : `${s} – ${e}`;
  }, [activeRange]);
  const notesText = activeRangeKey ? (notesMap[activeRangeKey] ?? "") : "";

  const monthAnimationClass = isMonthAnimating ? (monthSlideDirection === 1 ? "translate-x-1 opacity-30" : "-translate-x-1 opacity-30") : "translate-x-0 opacity-100";
  const flipAnimationClass = flipAnimationEnabled && !prefersReducedMotion && isMonthAnimating ? "[transform:perspective(1000px)_rotateX(8deg)]" : "[transform:perspective(1000px)_rotateX(0deg)]";
  const calendarTone = darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-neutral-200 bg-white";
  const shellTone = darkMode ? "border-slate-700 bg-slate-800/95 text-slate-100" : "border-neutral-200 bg-white";

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) globalThis.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = globalThis.setTimeout(() => setToastMessage(""), 1500);
  };

  const saveNotesForActiveRange = useCallback((source: "manual" | "auto") => {
    if (!activeRangeKey) return;
    const map = { ...notesMap };
    const trimmed = notesText.trim();
    if (!trimmed) delete map[activeRangeKey];
    else map[activeRangeKey] = notesText;
    safeWriteNotesMap(map);
    showToast(source === "manual" ? "Notes saved" : "Auto-saved");
  }, [activeRangeKey, notesMap, notesText]);

  const handleDateClick = (date: Date) => {
    const next = getNextSelection(startDate, endDate, date);
    setStartDate(next.start);
    setEndDate(next.end);
    setFocusedDate(normalizeDate(date));
  };

  const handleMonthChange = (direction: 1 | -1) => {
    if (isMonthAnimating) return;
    setMonthSlideDirection(direction);
    setIsMonthAnimating(true);
    globalThis.setTimeout(() => {
      setDisplayedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
      setFocusedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, prev.getDate()));
      setIsMonthAnimating(false);
    }, 150);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (event.key === "ArrowLeft") delta = -1;
    if (event.key === "ArrowRight") delta = 1;
    if (event.key === "ArrowUp") delta = -7;
    if (event.key === "ArrowDown") delta = 7;
    if (!delta && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (event.key === "Enter" || event.key === " ") {
      handleDateClick(focusedDate);
      return;
    }
    const next = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), focusedDate.getDate() + delta);
    setFocusedDate(next);
    if (next.getMonth() !== displayedMonth || next.getFullYear() !== displayedYear) {
      setDisplayedDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  useEffect(() => {
    const target = globalThis.document?.querySelector<HTMLButtonElement>(`[data-date="${toISODateKey(focusedDate)}"]`);
    target?.focus();
  }, [focusedDate, displayedDate]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", `${displayedYear}-${String(displayedMonth + 1).padStart(2, "0")}`);
    if (startDate) params.set("start", toISODateKey(startDate));
    else params.delete("start");
    if (endDate) params.set("end", toISODateKey(endDate));
    else params.delete("end");
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [displayedYear, displayedMonth, startDate, endDate, router, pathname, searchParams]);

  useEffect(() => {
    if (!activeRangeKey) return;
    if (saveTimerRef.current) globalThis.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = globalThis.setTimeout(() => saveNotesForActiveRange("auto"), 600);
    return () => {
      if (saveTimerRef.current) globalThis.clearTimeout(saveTimerRef.current);
    };
  }, [notesText, activeRangeKey, notesMap, saveNotesForActiveRange]);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const mediaQuery = globalThis.window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-4xl px-3 py-8 sm:px-6">
      <div className="mx-auto h-3 w-5 rounded-full border border-neutral-400 bg-neutral-200 shadow-sm" />
      <div className={`relative mt-2 rounded-2xl border p-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)] sm:p-4 ${shellTone}`}>
        <div className="pointer-events-none absolute -top-1 left-5 right-5 flex justify-between">
          {Array.from({ length: 18 }).map((_, ring) => (
            <span key={`ring-${ring + 1}`} className="h-2 w-0.5 rounded-full bg-neutral-700/70" />
          ))}
        </div>

        <div className="relative min-h-64 overflow-hidden rounded-xl bg-neutral-100 sm:min-h-80">
          <Image src="/mountain-hero.svg" alt="Mountain calendar hero" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute -bottom-14 -left-3 h-36 w-[60%] bg-sky-500 [clip-path:polygon(0_32%,100%_0,100%_100%,0_100%)]" />
          <div className="absolute -bottom-16 right-0 h-36 w-[56%] bg-sky-600 [clip-path:polygon(0_0,100%_30%,100%_100%,0_100%)]" />
          <div className="absolute bottom-8 right-5 text-right">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80">WALL CALENDAR</p>
            <p className="text-xl font-semibold tracking-wide text-white sm:text-2xl">{imageOverlayMonth}</p>
          </div>
        </div>

        <div
          className={[
            "relative z-[2] -mt-[10px] w-full drop-shadow-[0_4px_0_rgba(0,0,0,0.05)]",
            prefersReducedMotion ? "" : "tear-off-edge-wiggle",
          ].join(" ")}
          aria-hidden
        >
          <svg
            className="block h-[12px] w-full text-white sm:h-[14px]"
            viewBox="0 0 600 12"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Torn paper edge</title>
            <path
              fill="currentColor"
              d="M0 0v6l7.5 6L15 6l7.5 6L30 6l7.5 6L45 6l7.5 6L60 6l7.5 6L75 6l7.5 6L90 6l7.5 6L105 6l7.5 6L120 6l7.5 6L135 6l7.5 6L150 6l7.5 6L165 6l7.5 6L180 6l7.5 6L195 6l7.5 6L210 6l7.5 6L225 6l7.5 6L240 6l7.5 6L255 6l7.5 6L270 6l7.5 6L285 6l7.5 6L300 6l7.5 6L315 6l7.5 6L330 6l7.5 6L345 6l7.5 6L360 6l7.5 6L375 6l7.5 6L390 6l7.5 6L405 6l7.5 6L420 6l7.5 6L435 6l7.5 6L450 6l7.5 6L465 6l7.5 6L480 6l7.5 6L495 6l7.5 6L510 6l7.5 6L525 6l7.5 6L540 6l7.5 6L555 6l7.5 6L570 6l7.5 6L585 6l7.5 6L600 6V0z"
            />
          </svg>
        </div>
        <div className="relative z-[2] -mt-px px-2 sm:px-3">
          <div
            className={[
              "h-0.5 w-full rounded-full",
              prefersReducedMotion ? "bg-neutral-300" : "tear-off-perf",
            ].join(" ")}
          />
          <p
            className={[
              "mt-1.5 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400",
              prefersReducedMotion ? "" : "animate-pulse",
            ].join(" ")}
          >
            {"Perforated — lift corner to \"tear\""}
          </p>
        </div>

        <div className={`rounded-b-xl px-2 pb-8 pt-3 sm:px-3 sm:pb-10 ${darkMode ? "bg-slate-900/90" : "bg-white"}`}>
          <header className="mb-3 border-b border-neutral-200 pb-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className={`text-lg font-semibold tracking-tight sm:text-xl ${darkMode ? "text-slate-100" : "text-neutral-900"}`}>{monthYear}</h1>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFlipAnimationEnabled((prev) => !prev)}
                  className={[
                    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden",
                    prefersReducedMotion ? "opacity-60" : "",
                  ].join(" ")}
                  aria-label={flipAnimationEnabled ? "Disable flip animation" : "Enable flip animation"}
                  title={flipAnimationEnabled ? "Flip on" : "Flip off"}
                >
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.5 5.5H15.5V14.5H4.5V5.5Z"
                      className={flipAnimationEnabled ? "stroke-current" : "stroke-neutral-400"}
                      strokeWidth="1.4"
                    />
                    <path
                      d="M10 5.5V14.5"
                      className={flipAnimationEnabled ? "stroke-current" : "stroke-neutral-400"}
                      strokeWidth="1.2"
                      strokeDasharray={flipAnimationEnabled ? "0" : "2 2"}
                    />
                    <path
                      d="M10 5.5C11.9 6.4 13.4 7.4 15.5 9.2"
                      className={flipAnimationEnabled ? "stroke-current" : "stroke-neutral-400"}
                      strokeWidth="1.1"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipAnimationEnabled((prev) => !prev)}
                  className={[
                    "hidden h-8 rounded-md border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 md:inline-flex md:items-center",
                    prefersReducedMotion ? "opacity-60" : "",
                  ].join(" ")}
                >
                  Flip: {flipAnimationEnabled ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(-1)}
                  disabled={isMonthAnimating}
                  className="h-8 w-8 rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous month"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMonthChange(1)}
                  disabled={isMonthAnimating}
                  className="h-8 w-8 rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next month"
                >
                  {">"}
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-[170px_1fr] md:gap-5">
            <aside className={`rounded-lg border p-3 sm:p-4 ${calendarTone}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h2 className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${darkMode ? "text-slate-200" : "text-neutral-700"}`}>
                    Notes
                  </h2>
                  <p className={`mt-1 text-[11px] ${darkMode ? "text-slate-300" : "text-neutral-500"}`}>
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
                      "Select a date or range"
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveNotesForActiveRange("manual")}
                  disabled={!activeRangeKey}
                  className={[
                    "h-8 shrink-0 rounded-md px-2.5 text-xs font-medium transition-colors",
                    activeRangeKey
                      ? accentTheme.saveButton
                      : darkMode
                        ? "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "cursor-not-allowed bg-neutral-100 text-neutral-400",
                  ].join(" ")}
                >
                  Save
                </button>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => {
                  if (!activeRangeKey) return;
                  const value = e.target.value;
                  setNotesMap((prev) => ({ ...prev, [activeRangeKey]: value }));
                }}
                disabled={!activeRangeKey}
                className={[
                  "min-h-40 w-full resize-none rounded-md border p-2 text-sm outline-none transition-shadow placeholder:text-neutral-400 sm:min-h-44",
                  activeRangeKey
                    ? `${darkMode ? "border-slate-600 bg-slate-800 text-slate-100" : "border-neutral-200 bg-neutral-50 text-neutral-700"} focus:ring-2 ${accentTheme.inputFocus}`
                    : darkMode
                      ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-400"
                      : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500",
                ].join(" ")}
                placeholder={
                  activeRangeKey ? "Write reminders, tasks, or ideas..." : "Select a date or range first."
                }
              />
            </aside>

            <div
              className={[
                `rounded-lg border p-3 transition-all duration-200 will-change-transform sm:p-4 ${calendarTone}`,
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
                      weekdayIndex >= 5 ? (darkMode ? "text-slate-400" : "text-neutral-400") : darkMode ? "text-slate-300" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3" onKeyDown={handleGridKeyDown} role="grid" aria-label={`Calendar for ${monthYear}`}>
                {calendarDays.map(({ date, isCurrentMonth }) => {
                  const normalizedDate = normalizeDate(date);
                  const isToday =
                    date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isStartDate = sameDate(startDate, normalizedDate);
                  const isEndDate = sameDate(endDate, normalizedDate);
                  const hasRange = Boolean(startDate && endDate);
                  const isInRange = Boolean(
                    hasRange &&
                      startDate &&
                      endDate &&
                      normalizedDate > normalizeDate(startDate) &&
                      normalizedDate < normalizeDate(endDate),
                  );
                  const isFocused = sameDate(focusedDate, normalizedDate);
                  const holidayLabel = getHolidayLabel(date);

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      data-date={toISODateKey(date)}
                      tabIndex={isFocused ? 0 : -1}
                      aria-label={buildDayAriaLabel(date, holidayLabel)}
                      aria-pressed={isStartDate || isEndDate || isInRange}
                      title={holidayLabel ?? undefined}
                      className={[
                        "relative aspect-square min-h-[44px] rounded-md border text-base transition duration-150 md:min-h-0 md:text-sm",
                        prefersReducedMotion ? "" : "hover:scale-[1.03] active:scale-[0.98]",
                        isStartDate || isEndDate
                          ? accentTheme.selected
                          : darkMode
                            ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                            : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                        isInRange ? accentTheme.range : "",
                        isWeekend && !isToday && !isInRange && !isStartDate && !isEndDate
                          ? darkMode
                            ? "border-dashed bg-slate-800/80"
                            : "border-dashed bg-neutral-50/80"
                          : "",
                        isToday && !isStartDate && !isEndDate
                          ? accentTheme.today
                          : "",
                        !isCurrentMonth && !isToday && !isStartDate && !isEndDate && !isInRange
                          ? darkMode
                            ? "text-slate-500"
                            : "text-neutral-400"
                          : "",
                        isFocused ? "ring-2 ring-offset-1 ring-sky-300" : "",
                      ].join(" ")}
                    >
                      {(isWeekend || holidayLabel) && isCurrentMonth && (
                        <span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${holidayLabel ? "bg-rose-400" : darkMode ? "bg-slate-500" : "bg-neutral-300"}`} />
                      )}
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className={`mt-3 text-xs ${darkMode ? "text-slate-300" : "text-neutral-500"}`}>
                Holidays are marked with <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400 align-middle" /> dots.
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-0 right-0 z-[3] h-[52px] w-[52px] sm:h-[58px] sm:w-[58px]"
            aria-hidden
          >
            <div
              className={[
                "h-full w-full rounded-tl-md border-l border-t border-neutral-300/80 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 shadow-[0_4px_12px_rgba(0,0,0,0.12)] [clip-path:polygon(100%_0,100%_100%,0_100%)]",
                prefersReducedMotion ? "" : "tear-off-peel",
              ].join(" ")}
            />
          </div>
        </div>
        <div aria-live="polite" className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
          {toastMessage ? (
            <div className="rounded-md bg-black/80 px-3 py-1 text-xs font-medium text-white">{toastMessage}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
