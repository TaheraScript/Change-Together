"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Gift,
  Mail,
  MapPin,
  Snowflake,
  Stethoscope,
  Trash2,
  TreePine,
  Users,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  formatEventDate,
  getEventsSnapshot,
  getServerEventsSnapshot,
  subscribeToEvents,
} from "@/lib/events";

const TYPE_ICONS: Record<string, LucideIcon> = {
  Cleanup: Trash2,
  Plantation: TreePine,
  Donation: Gift,
  "Winter Relief": Snowflake,
  "Food Drive": Utensils,
  "Health Camp": Stethoscope,
  Education: BookOpen,
  "Community Support": Users,
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default function UpcomingEventsList() {
  const events = useSyncExternalStore(
    subscribeToEvents,
    getEventsSnapshot,
    getServerEventsSnapshot,
  );
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const justCreated = searchParams.get("created") === "1" && !dismissed;

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      window.history.replaceState(null, "", "/upcoming-events");
    }
  }, [searchParams]);

  return (
    <div>
      {justCreated && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm text-green-800"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Your event was published successfully!
              </p>
              <p className="text-green-700/80">
                It is now listed below with your email as the organiser.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss success message"
            className="rounded-full p-1 text-green-700 transition hover:bg-green-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {events === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-green-200 bg-white/70 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
            <CalendarPlus size={26} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-[#164E63]">
            No events yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Be the first to bring people together. Publish a community event
            and it will appear here instantly.
          </p>
          <Link
            href="/create-event"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#164E63] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
          >
            <CalendarPlus size={17} />
            Create an Event
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {events.length} {events.length === 1 ? "event" : "events"} planned
            by the community
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const TypeIcon = TYPE_ICONS[event.type] ?? Users;
              return (
                <article
                  key={event.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.thumbnailUrl}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A] shadow-sm backdrop-blur-sm">
                      <TypeIcon size={12} />
                      {event.type}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#164E63]">
                      <CalendarDays size={14} className="text-[#F59E0B]" />
                      {formatEventDate(event.date)}
                    </p>
                    <h2 className="mt-2 text-lg font-bold leading-snug text-[#164E63]">
                      {event.title}
                    </h2>
                    <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-slate-500">
                      <MapPin size={15} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{event.location}</span>
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {event.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{event.organizerEmail}</span>
                      <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                        Organiser
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
