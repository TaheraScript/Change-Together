import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import UpcomingEventsList from "@/components/event/UpcomingEventsList";

export const metadata: Metadata = {
  title: "Upcoming Events | Change Together",
  description:
    "Discover community clean-ups, plantation drives and donation events happening soon.",
};

export default function UpcomingEventsPage() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                Upcoming Events
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
              Events happening <span className="text-[#16A34A]">soon.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Find a drive near you, meet neighbours who care, and lend a hand
              where it matters most.
            </p>
          </div>

          <Link
            href="/create-event"
            className="inline-flex items-center gap-2 rounded-xl bg-[#164E63] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Create an Event
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          }
        >
          <UpcomingEventsList />
        </Suspense>
      </div>
    </section>
  );
}
