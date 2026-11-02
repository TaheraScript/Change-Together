import type { Metadata } from "next";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CalendarDays,
  LogIn,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeToUser,
} from "@/lib/auth";
import { getUpcomingEvents, type EventRecord } from "@/lib/events";
import ManageEventCard from "@/components/event/ManageEventCard";

export const metadata: Metadata = {
  title: "Manage Your Events | Change Together",
  description:
    "View, update or cancel the community events you have organised.",
};

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

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700"
    >
      <XCircle size={26} />
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-[#164E63] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0e3a4b]"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-green-200 bg-white/80 px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
        <CalendarDays size={26} />
      </span>
      <h2 className="mt-4 text-xl font-bold text-[#164E63]">
        You haven&apos;t created any events yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Events you organise will appear here. Create your first drive and
        invite volunteers to join.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        <Link
          href="/create-event"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
        >
          <CalendarPlus size={17} />
          Create new event
        </Link>
      </div>
    </div>
  );
}

export default function ManageEventsPage() {
  const user = useSyncExternalStore(
    subscribeToUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const email = user?.email ?? "";

  const [events, setEvents] = useState<EventRecord[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!email) return;

    async function loadMyEvents() {
      try {
        const allEvents = await getUpcomingEvents();
        if (!cancelled) {
          setEvents(
            allEvents.filter(
              (event) =>
                event.organizerEmail.toLowerCase() === email.toLowerCase(),
            ),
          );
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load your events. Please try again.");
        }
      }
    }

    loadMyEvents();
    return () => {
      cancelled = true;
    };
  }, [email, reloadKey]);

  const myEvents = events ?? [];

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
          <LogIn size={26} />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-[#164E63]">
          Log in to manage your events
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Managing events is linked to your account. Log in to see the events
          you created, or create an account to get started.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/login?next=/manage-events"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <LogIn size={17} />
            Log in
          </Link>
          <Link
            href="/register?next=/manage-events"
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
            setEvents(null);
            setReloadKey((key) => key + 1);
          }}
          className="rounded-xl bg-[#164E63] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0e3a4b]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (events === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBFAF6] py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                Manage Events
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
              Events you&apos;ve <span className="text-[#16A34A]">organised.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              View, update or cancel the community drives you created. Only you
              can make changes to your own events.
            </p>
          </div>

          <Link
            href="/create-event"
            className="inline-flex items-center gap-2 rounded-xl bg-[#164E63] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Create new event
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#164E63]">
                {myEvents.length}
              </span>{" "}
              upcoming {myEvents.length === 1 ? "event" : "events"}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myEvents.map((event) => (
                <ManageEventCard
                  key={event._id}
                  event={event}
                  onDeleted={() => {
                    setEvents(null);
                    setReloadKey((key) => key + 1);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
