"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, XCircle } from "lucide-react";
import {
  getMyJoinedEvents,
  type JoinedEventRecord,
} from "@/lib/events";
import EventCard from "./EventCard";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function JoinedEventsList() {
  // The route reads the session server-side, so no email is passed around.
  const [joins, setJoins] = useState<JoinedEventRecord[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMyJoinedEvents()
      .then((joinedEvents) => {
        if (cancelled) return;
        // Every joined event stays visible, ordered by the event date.
        setJoins(
          [...joinedEvents].sort(
            (a, b) =>
              a.event.date.localeCompare(b.event.date) ||
              b.joinedAt.localeCompare(a.joinedAt),
          ),
        );
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setError("We couldn't load the events you've joined. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700"
      >
        <XCircle size={26} />
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setJoins(null);
            setReloadKey((key) => key + 1);
          }}
          className="rounded-xl bg-[#164E63] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0e3a4b]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (joins === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (joins.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-green-200 bg-white/80 px-6 py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
          <CalendarPlus size={26} />
        </span>
        <h2 className="mt-4 text-xl font-bold text-[#164E63]">
          You haven&apos;t joined any events yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Find a drive near you and reserve your spot in one click. Events you
          join will appear here.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/upcoming-events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Explore upcoming events
          </Link>
          <Link
            href="/create-event"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            Create an event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 inline-flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <CheckCircle2 size={15} className="text-[#16A34A]" />
        You&apos;ve joined{" "}
        <span className="font-semibold text-[#164E63]">{joins.length}</span>{" "}
        {joins.length === 1 ? "event" : "events"}
        <span className="text-slate-400">· sorted by event date</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {joins.map((item) => (
          <EventCard
            key={item.event._id}
            event={item.event}
            joinedAt={item.joinedAt}
          />
        ))}
      </div>
    </div>
  );
}
