type Variant = "horizontal" | "sidebar" | "inline";

interface Props {
  variant?: Variant;
}

/**
 * Placeholder shown when no active banner exists for a given slot.
 * Renders a dashed-border box matching the real BannerSlot dimensions.
 */
export default function BannerPlaceholder({ variant = "horizontal" }: Props) {
  if (variant === "sidebar") {
    return (
      <div className="border border-dashed border-[#E2E8F0] rounded-lg overflow-hidden bg-[#FAFBFC]">
        <div className="aspect-[4/3] w-full flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-[#CBD5E1] mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Reklam Alanı</p>
          </div>
        </div>
        <div className="p-3">
          <div className="h-2 bg-[#E2E8F0]/60 rounded w-12 mb-2" />
          <div className="h-3 bg-[#E2E8F0]/60 rounded w-full mb-1" />
          <div className="h-2 bg-[#E2E8F0]/60 rounded w-16" />
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-4 border border-dashed border-[#E2E8F0] rounded-lg px-5 py-4 bg-[#FAFBFC]">
        <div className="w-14 h-14 rounded-lg bg-[#E2E8F0]/60 shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#CBD5E1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold text-[#CBD5E1] uppercase tracking-wider">Reklam Alanı</p>
          <div className="h-3 bg-[#E2E8F0]/60 rounded w-3/4 mt-1" />
        </div>
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className="flex items-center justify-between gap-6 border border-dashed border-[#E2E8F0] rounded-lg px-6 py-4 bg-[#FAFBFC]">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-[#E2E8F0]/60 shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#CBD5E1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Reklam Alanı</p>
          <div className="h-3 bg-[#E2E8F0]/60 rounded w-40 mt-1" />
        </div>
      </div>
      <div className="h-2 bg-[#E2E8F0]/60 rounded w-12 shrink-0" />
    </div>
  );
}
