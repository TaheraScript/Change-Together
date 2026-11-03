"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  LogIn,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getMyJoinedEvents,
  isUpcoming,
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
  const { data: session } = useSession();
  const user = session?.user
    ? {
        email: session.user.email,
        displayName: session.user.name ?? "",
        photoURL: session.user.image ?? undefined,
      }
    : null;
  const email = user?.email ?? "";

  const [data, setData] = useState<{
    email: string;
    joins: JoinedEventRecord[];
  } | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!email) return;

    async function loadJoinedEvents() {
      try {
        const joinedEvents = await getMyJoinedEvents(email);
        if (!cancelled) {
          setData({
            email,
            joins: joinedEvents.filter((item) => isUpcoming(item.event.date)),
          });
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load the events you've joined. Please try again.");
        }
      }
    }

    loadJoinedEvents();
    return () => {
      cancelled = true;
    };
  }, [email, reloadKey]);

  const joins = data?.email === email ? data.joins : null;

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
          <LogIn size={26} />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-[#164E63]">
          Log in to see your events
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Joined events are linked to your account. Log in to pick up where
          you left off, or create an account to start joining drives.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/login?next=/joined-events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <LogIn size={17} />
            Log in
          </Link>
          <Link
            href="/register?next=/joined-events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            <UserPlus size={17} />
            Create account
          </Link>
        </div>
      </div>
    );
  }

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
            setData(null);
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
      <p className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <CheckCircle2 size={15} className="text-[#16A34A]" />
        You&apos;re going to{" "}
        <span className="font-semibold text-[#164E63]">{joins.length}</span>{" "}
        upcoming {joins.length === 1 ? "event" : "events"}
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
