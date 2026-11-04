import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarPlus } from "lucide-react";
import UpcomingEventsList from "@/components/event/UpcomingEventsList";
import CreatedEventToast from "@/components/event/CreatedEventToast";
import type { EventRecord } from "@/lib/events";
import { listUpcomingEvents } from "@/lib/events-server";

export const metadata: Metadata = {
  title: "Upcoming Events | Change Together",
  description:
    "Discover community clean-ups, plantation drives and donation events happening soon.",
};

// Always re-read the calendar so newly created events appear immediately.
export const dynamic = "force-dynamic";

export default async function UpcomingEventsPage() {
  // Mongo first, REST fallback — undefined lets the list retry in the browser.
  let events: EventRecord[] | undefined;

  try {
    events = await listUpcomingEvents();
  } catch {
    events = undefined;
  }

  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <Suspense fallback={null}>
        <CreatedEventToast />
      </Suspense>
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                Upcoming Events
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-[#164E63] sm:text-3xl md:text-4xl">
              Events happening <span className="text-[#16A34A]">soon.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Find a drive near you, meet neighbours who care, and lend a hand
              where it matters most. Past events are hidden automatically.
            </p>
          </div>

          <Link
            href="/create-event"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Create an Event
          </Link>
        </div>

        <UpcomingEventsList events={events} />
      </div>
    </section>
  );
}
