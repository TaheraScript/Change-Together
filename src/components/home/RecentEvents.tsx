"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarPlus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import EventCard from "@/components/event/EventCard";
import type { EventRecord } from "@/lib/events";

type Status = "loading" | "ready" | "error";

type RecentEventsResponse = {
  events?: EventRecord[];
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function RecentEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/recent-events", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json() as Promise<RecentEventsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setEvents([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  };

  return (
    <section id="recent-events" className="bg-[#FBFAF6] py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
              <Sparkles size={14} />
              Happening soon
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#164E63] md:text-4xl">
              Recent upcoming events
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The six nearest drives added by our community. Pick one, show up,
              and bring a friend.
            </p>
          </div>

          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#164E63] shadow-sm transition hover:border-green-300 hover:text-[#16A34A]"
          >
            See all events
            <ArrowRight size={16} />
          </Link>
        </div>

        {status === "loading" && (
          <div
            aria-busy="true"
            aria-label="Loading upcoming events"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50/60 px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <CalendarClock size={22} />
            </span>
            <h3 className="mt-3 text-base font-bold text-[#164E63]">
              Couldn&apos;t load events
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
              The event feed didn&apos;t respond. Check your connection and try
              again.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#164E63] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e3a4b]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {status === "ready" && events.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#16A34A]">
              <CalendarClock size={22} />
            </span>
            <h3 className="mt-3 text-base font-bold text-[#164E63]">
              No upcoming events yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
              The calendar is empty right now. Be the first to organise a drive
              for your neighbourhood.
            </p>
            <Link
              href="/create-event"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <CalendarPlus size={16} />
              Create an event
            </Link>
          </div>
        )}

        {status === "ready" && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
