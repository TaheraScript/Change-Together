"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Loader2, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getUpcomingEvents,
  isEventOwner,
  type EventRecord,
} from "@/lib/events";
import ManageEventCard from "@/components/event/ManageEventCard";
import { toast } from "@/components/ui/toast";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function ManageEventPage() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? "";

  const [allEvents, setAllEvents] = useState<EventRecord[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((data) => {
        if (!cancelled) setAllEvents(data);
      })
      .catch(() => {
        if (cancelled) return;
        setAllEvents([]);
        toast.add({
          type: "error",
          title: "Couldn't load events",
          description: "Please check your connection and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  // Only the events this volunteer created can be edited or deleted.
  const myEvents = (allEvents ?? []).filter((event) =>
    isEventOwner(event, email),
  );

  const loading = isPending || (Boolean(email) && allEvents === null);

  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              Your events
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-[#164E63] sm:text-3xl md:text-4xl">
              Manage your <span className="text-[#16A34A]">events.</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Update the details or cancel a drive you organised. You can only
              change events that belong to your account.
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

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : myEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-green-200 bg-white/80 px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
              <CalendarPlus size={26} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-[#164E63]">
              Nothing to manage yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              You haven&apos;t created any events on this account. Publish your
              first drive and it will show up here.
            </p>
            <Link
              href="/create-event"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white shadow-md shadow-green-700/20 transition hover:bg-green-700"
            >
              <CalendarPlus size={17} />
              Create your first event
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <ShieldCheck size={15} className="text-[#16A34A]" />
                <span className="font-semibold text-[#164E63]">
                  {myEvents.length}
                </span>
                {myEvents.length === 1 ? "event" : "events"} created by you
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                <ShieldCheck size={12} />
                Owner-only actions
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myEvents.map((event) => (
                <ManageEventCard
                  key={event._id}
                  event={event}
                  onDeleted={reload}
                  onUpdated={reload}
                />
              ))}
            </div>
          </>
        )}

        {loading && allEvents === null ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Loading your events…
          </p>
        ) : null}
      </div>
    </section>
  );
}
