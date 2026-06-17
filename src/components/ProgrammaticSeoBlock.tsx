import React from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  created_at: string;
  firm: {
    name: string;
    slug: string;
  };
}

interface Props {
  seoContent?: string | null;
  faqs?: FAQ[] | null;
  recentReviews?: Review[] | null;
  regionName: string;
}

export default function ProgrammaticSeoBlock({ seoContent, faqs, recentReviews, regionName }: Props) {
  const hasContent = !!seoContent;
  const hasFaqs = faqs && faqs.length > 0;
  const hasReviews = recentReviews && recentReviews.length > 0;

  if (!hasContent && !hasFaqs && !hasReviews) return null;

  return (
    <div className="mt-12 pt-8 border-t border-[#E2E8F0] space-y-12">
      {/* 1. SEO Makale İçeriği */}
      {hasContent && (
        <div className="prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-[#0F172A] prose-p:text-[#0F172A]/75 prose-p:leading-relaxed prose-a:text-[#0EA5E9] prose-a:no-underline hover:prose-a:underline">
          <div dangerouslySetInnerHTML={{ __html: seoContent }} />
        </div>
      )}

      {/* 2. Bölgedeki Müşteri Yorumları */}
      {hasReviews && (
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] mb-6">
            {regionName} Su Arıtma Firmaları Müşteri Yorumları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-bold text-xs">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A]">{review.author_name}</div>
                      <a href={`/firma/${review.firm.slug}`} className="text-[10px] text-[#0EA5E9] hover:underline font-semibold block -mt-0.5">
                        {review.firm.name}
                      </a>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}>★</span>
                    ))}
                  </div>
                </div>
                {review.body && (
                  <p className="text-xs text-[#0F172A]/70 leading-relaxed italic mt-2">"{review.body}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sıkça Sorulan Sorular (SSS) */}
      {hasFaqs && (
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-[#E2E8F0] rounded-lg [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-sm text-[#0F172A]">
                  {faq.question}
                  <span className="transition group-open:rotate-180 text-[#0EA5E9]">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-[#0F172A]/70 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
