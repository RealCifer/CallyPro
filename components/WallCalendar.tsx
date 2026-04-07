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

export default function WallCalendar() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const imageOverlayMonth = now
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const calendarDays = generateCalendarDays(currentMonth, currentYear);

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

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <aside className="rounded-lg border border-neutral-200 bg-white p-3">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Notes
              </h2>
              <textarea
                className="min-h-44 w-full resize-none rounded-md border border-neutral-200 bg-neutral-50 p-2 text-sm text-neutral-700 outline-none transition-shadow placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-200"
                placeholder="Write reminders, tasks, or ideas..."
              />
            </aside>

            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="mb-2 grid grid-cols-7 gap-2">
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

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(({ date, isCurrentMonth }) => {
                  const isToday =
                    date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={[
                        "aspect-square rounded-md border text-sm transition-colors duration-150",
                        isToday
                          ? "border-blue-400 bg-blue-50 font-semibold text-blue-700"
                          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100",
                        isWeekend && !isToday ? "bg-neutral-50/70" : "",
                        !isCurrentMonth && !isToday ? "text-neutral-400" : "",
                      ].join(" ")}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
