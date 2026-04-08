"use client";

import { useState } from "react";
import WallCalendar from "@/components/WallCalendar";

export default function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    if (globalThis.window === undefined) return false;
    return globalThis.window.localStorage.getItem("callypro:theme") === "dark";
  });

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    globalThis.window.localStorage.setItem("callypro:theme", next ? "dark" : "light");
  };

  return (
    <main
      className={[
        "relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-10",
        darkMode ? "bg-[#0b1b2c]" : "bg-[#dff2ff]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.95)_0%,rgba(207,235,255,0.75)_35%,rgba(132,199,246,0.5)_70%,rgba(87,163,227,0.42)_100%)] bg-sky-drift" />
      <div className="pointer-events-none absolute -top-16 left-0 right-0 h-52 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.88),rgba(255,255,255,0.1),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[46vh] bg-[linear-gradient(to_top,rgba(24,108,179,0.62),rgba(55,140,205,0.38),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.55)_0%,transparent_34%),radial-gradient(circle_at_80%_22%,rgba(255,255,255,0.45)_0%,transparent_30%),radial-gradient(circle_at_55%_6%,rgba(255,255,255,0.35)_0%,transparent_38%)]" />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40vh] opacity-55 [clip-path:polygon(0_100%,0_52%,8%_58%,16%_48%,24%_61%,33%_50%,42%_64%,51%_52%,61%_68%,70%_54%,79%_69%,88%_56%,100%_66%,100%_100%)] bg-[linear-gradient(to_top,rgba(21,94,165,0.8),rgba(21,94,165,0.35))]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[34vh] opacity-70 [clip-path:polygon(0_100%,0_67%,10%_74%,20%_62%,30%_77%,40%_65%,50%_80%,61%_68%,72%_81%,83%_70%,93%_84%,100%_74%,100%_100%)] bg-[linear-gradient(to_top,rgba(14,72,135,0.86),rgba(14,72,135,0.4))]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-24 w-56 rounded-full bg-white/65 blur-2xl sm:h-28 sm:w-72" />
      <div className="pointer-events-none absolute right-[10%] top-[18%] h-20 w-48 rounded-full bg-white/55 blur-2xl sm:h-24 sm:w-64" />
      <div className="pointer-events-none absolute left-1/2 top-[26%] h-16 w-44 -translate-x-1/2 rounded-full bg-white/40 blur-2xl sm:h-20 sm:w-64" />

      <div className="pointer-events-none absolute left-[22%] top-[19%] hidden opacity-65 md:block">
        <svg viewBox="0 0 120 44" className="h-7 w-20 text-sky-700/55" fill="none" aria-hidden="true">
          <path d="M10 28c6-10 16-10 22 0M33 28c6-9 16-9 22 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 18c5-8 12-8 18 0M78 18c5-8 12-8 18 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-[18%] top-[24%] hidden opacity-55 md:block">
        <svg viewBox="0 0 120 44" className="h-6 w-16 text-sky-800/50" fill="none" aria-hidden="true">
          <path d="M14 24c5-8 12-8 18 0M32 24c5-8 12-8 18 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M52 16c4-7 10-7 14 0M66 16c4-7 10-7 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="pointer-events-none absolute left-[14%] top-[9%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.15)] float-card md:flex">
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-sky-500" fill="none" aria-hidden="true">
          <path
            d="M10 2.5L11.8 8.2L17.5 10L11.8 11.8L10 17.5L8.2 11.8L2.5 10L8.2 8.2L10 2.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="pointer-events-none absolute left-[30%] top-[13%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:0.7s] float-card md:flex">
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-violet-500" fill="none" aria-hidden="true">
          <path
            d="M7.2 6.2A2.7 2.7 0 0 1 9.9 3.5h.2a2.7 2.7 0 0 1 2.7 2.7v.3a2.2 2.2 0 0 1 1.8 2.2 2.2 2.2 0 0 1-.7 1.6 2 2 0 0 1 .7 1.5A2.2 2.2 0 0 1 12.4 14h-.2a2.2 2.2 0 0 1-2.2 2H9.8a2.2 2.2 0 0 1-2.2-2H7.4A2.2 2.2 0 0 1 5.2 12a2 2 0 0 1 .7-1.5 2.2 2.2 0 0 1-.7-1.6 2.2 2.2 0 0 1 2-2.2V6.2Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-[22%] top-[11%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:1.1s] float-card md:flex">
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-emerald-500" fill="none" aria-hidden="true">
          <rect x="3.2" y="4.6" width="13.6" height="11.8" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3.2 8.3H16.8M6.5 2.9V6M13.5 2.9V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[16%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:1.7s] float-card md:flex">
        <svg viewBox="0 0 20 20" className="h-5 w-5 text-teal-500" fill="none" aria-hidden="true">
          <path
            d="M10 16.6V9.5M10 9.5C10 6 12.4 4 15.6 3.4C15.6 7.7 13.6 10 10 10M10 9.5C10 6.5 8.1 4.7 4.4 4.1C4.4 8.2 6.5 10.2 10 10"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative z-20 mb-4 flex justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          className={[
            "rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
            darkMode
              ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
              : "border-white/70 bg-white/85 text-slate-700 hover:bg-white",
          ].join(" ")}
        >
          {darkMode ? "Switch to Light" : "Switch to Dark"}
        </button>
      </div>

      <div className="relative z-10">
        <WallCalendar darkMode={darkMode} />
      </div>
    </main>
  );
}
