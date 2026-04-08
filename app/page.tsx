import WallCalendar from "@/components/WallCalendar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#dff2ff] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.95)_0%,rgba(207,235,255,0.75)_35%,rgba(132,199,246,0.5)_70%,rgba(87,163,227,0.42)_100%)] bg-sky-drift" />
      <div className="pointer-events-none absolute -top-16 left-0 right-0 h-52 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.88),rgba(255,255,255,0.1),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[46vh] bg-[linear-gradient(to_top,rgba(24,108,179,0.62),rgba(55,140,205,0.38),transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.55)_0%,transparent_34%),radial-gradient(circle_at_80%_22%,rgba(255,255,255,0.45)_0%,transparent_30%),radial-gradient(circle_at_55%_6%,rgba(255,255,255,0.35)_0%,transparent_38%)]" />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40vh] opacity-55 [clip-path:polygon(0_100%,0_52%,8%_58%,16%_48%,24%_61%,33%_50%,42%_64%,51%_52%,61%_68%,70%_54%,79%_69%,88%_56%,100%_66%,100%_100%)] bg-[linear-gradient(to_top,rgba(21,94,165,0.8),rgba(21,94,165,0.35))]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[34vh] opacity-70 [clip-path:polygon(0_100%,0_67%,10%_74%,20%_62%,30%_77%,40%_65%,50%_80%,61%_68%,72%_81%,83%_70%,93%_84%,100%_74%,100%_100%)] bg-[linear-gradient(to_top,rgba(14,72,135,0.86),rgba(14,72,135,0.4))]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-24 w-56 rounded-full bg-white/65 blur-2xl sm:h-28 sm:w-72" />
      <div className="pointer-events-none absolute right-[10%] top-[18%] h-20 w-48 rounded-full bg-white/55 blur-2xl sm:h-24 sm:w-64" />
      <div className="pointer-events-none absolute left-1/2 top-[26%] h-16 w-44 -translate-x-1/2 rounded-full bg-white/40 blur-2xl sm:h-20 sm:w-64" />

      <div className="pointer-events-none absolute left-[14%] top-[9%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-lg shadow-[0_8px_18px_rgba(0,0,0,0.15)] float-card md:flex">
        ✨
      </div>
      <div className="pointer-events-none absolute left-[30%] top-[13%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-lg shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:0.7s] float-card md:flex">
        🧠
      </div>
      <div className="pointer-events-none absolute right-[22%] top-[11%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-lg shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:1.1s] float-card md:flex">
        📅
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[16%] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/85 text-lg shadow-[0_8px_18px_rgba(0,0,0,0.15)] [animation-delay:1.7s] float-card md:flex">
        🌿
      </div>

      <div className="relative z-10">
        <WallCalendar />
      </div>
    </main>
  );
}
