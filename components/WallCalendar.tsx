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
  const calendarDays = generateCalendarDays(currentMonth, currentYear);

  return (
    <section className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
        <div className="relative min-h-56 overflow-hidden rounded-xl bg-neutral-100 sm:min-h-72 lg:min-h-full">
          <Image
            src="/hero-placeholder.svg"
            alt="Calendar hero placeholder"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <header className="mb-4 border-b border-neutral-200 pb-3">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              {monthYear}
            </h1>
          </header>

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <aside className="rounded-lg border border-dashed border-neutral-300 bg-white p-3">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Notes
              </h2>
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, noteLine) => (
                  <div key={`note-line-${noteLine + 1}`} className="h-5 rounded bg-neutral-100" />
                ))}
              </div>
            </aside>

            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-xs font-medium uppercase tracking-wide text-neutral-500"
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

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={[
                        "aspect-square rounded-md border text-sm transition-colors",
                        isToday
                          ? "border-blue-400 bg-blue-50 font-semibold text-blue-700"
                          : "border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100",
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
