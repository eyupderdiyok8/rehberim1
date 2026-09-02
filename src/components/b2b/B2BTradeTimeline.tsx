import { B2B_STATUS_LABELS, B2B_STATUS_STEPS } from "@/lib/b2b-ui";

export default function B2BTradeTimeline({ status }: { status: string }) {
  const terminal = status === "cancelled" || status === "disputed";
  const activeIndex = B2B_STATUS_STEPS.indexOf(status as (typeof B2B_STATUS_STEPS)[number]);

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4" aria-label="Ticaret süreci">
      <div className="flex items-center justify-between gap-2">
        {B2B_STATUS_STEPS.map((step, index) => {
          const complete = !terminal && index <= activeIndex;
          return (
            <div key={step} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
              {index > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${complete ? "bg-sky-500" : "bg-slate-200"}`} />}
              <span className={`relative z-10 grid size-6 place-items-center rounded-full border-2 text-[9px] font-black ${complete ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 bg-white text-slate-400"}`}>{complete ? "✓" : index + 1}</span>
              <span className={`mt-2 hidden text-[9px] font-black sm:block ${complete ? "text-slate-800" : "text-slate-400"}`}>{B2B_STATUS_LABELS[step]}</span>
            </div>
          );
        })}
      </div>
      <p className={`mt-3 text-center text-xs font-black sm:hidden ${terminal ? "text-amber-700" : "text-slate-700"}`}>{B2B_STATUS_LABELS[status] ?? status}</p>
      {terminal && <p className="mt-3 text-center text-xs font-black text-amber-700">{B2B_STATUS_LABELS[status]}</p>}
    </div>
  );
}
