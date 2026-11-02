import Link from "next/link";
import { CalendarDays, CalendarX } from "lucide-react";

export default function EventMessage({
  title,
  description,
  retryHref,
}: {
  title: string;
  description: string;
  retryHref?: string;
}) {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-[#F59E0B]">
            <CalendarX size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-[#164E63]">{title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {description}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link
              href="/upcoming-events"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
            >
              <CalendarDays size={17} />
              Browse upcoming events
            </Link>
            {retryHref && (
              <Link
                href={retryHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
              >
                Try again
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}