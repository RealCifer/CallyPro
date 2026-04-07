import Image from "next/image";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WallCalendar() {
  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="h-5 rounded bg-neutral-100" />
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
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-md border border-neutral-200 bg-neutral-50"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
