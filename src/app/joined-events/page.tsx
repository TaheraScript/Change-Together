import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import JoinedEventsList from "@/components/event/JoinedEventsList";

export const metadata: Metadata = {
  title: "My Events | Change Together",
  description: "The upcoming community events you've joined.",
};

export default function JoinedEventsPage() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                My Events
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
              Events you&apos;ve <span className="text-[#16A34A]">joined.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Everything you&apos;ve signed up for, in one place, sorted by event
              date. Show up, lend a hand and make a difference with your
              community.
            </p>
          </div>

          <Link
            href="/create-event"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Create new event
          </Link>
        </div>

        <JoinedEventsList />
      </div>
    </section>
  );
}
