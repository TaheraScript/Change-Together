"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  LayoutGrid,
  RotateCcw,
  Search,
  SearchX,
  X,
  XCircle,
} from "lucide-react";
import {
  EVENT_TYPES,
  getUpcomingEvents,
  isUpcoming,
  type EventRecord,
  type EventType,
} from "@/lib/events";
import { getEventTypeIcon } from "@/lib/event-icons";
import EventCard from "./EventCard";

type FilterType = EventType | "All";

type UpcomingEventsListProps = {
  compact?: boolean;
  events?: EventRecord[];
};

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function EventGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
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

function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-green-200 bg-white/80 px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
        <SearchX size={26} />
      </span>
      <h2 className="mt-4 text-xl font-bold text-[#164E63]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
        >
          <RotateCcw size={16} />
          Reset filters
        </button>
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

export default function UpcomingEventsList({
  compact = false,
  events: initialEvents,
}: UpcomingEventsListProps) {
  const [fetchedEvents, setFetchedEvents] = useState<EventRecord[] | null>(
    null,
  );
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeType, setActiveType] = useState<FilterType>("All");
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const justCreated = searchParams.get("created") === "1" && !dismissed;

  // Use the events passed from the server when available,
  // otherwise fall back to the ones fetched in the browser.
  const events = useMemo(
    () =>
      initialEvents
        ? initialEvents.filter((event) => isUpcoming(event.date))
        : fetchedEvents,
    [initialEvents, fetchedEvents],
  );

  useEffect(() => {
    // Events were provided by the parent, so there is nothing to fetch.
    if (initialEvents) return;

    let cancelled = false;

    async function loadEvents() {
      try {
        const data = await getUpcomingEvents();
        if (!cancelled) {
          setFetchedEvents(data.filter((event) => isUpcoming(event.date)));
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load events. Please try again.");
        }
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [initialEvents, reloadKey]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      window.history.replaceState(null, "", "/upcoming-events");
    }
  }, [searchParams]);

  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const event of events ?? []) {
      next[event.type] = (next[event.type] ?? 0) + 1;
    }
    return next;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();

    return (events ?? []).filter((event) => {
      const matchesType = activeType === "All" || event.type === activeType;
      const matchesSearch =
        !term || event.title.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [events, activeType, appliedSearch]);

  const isFiltering = activeType !== "All" || appliedSearch.length > 0;

  const resetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setActiveType("All");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const retry = () => {
    setError("");
    setFetchedEvents(null);
    setReloadKey((key) => key + 1);
  };

  const emptyTitle = isFiltering
    ? "No matching events found"
    : "No upcoming events yet";
  const emptyDescription = isFiltering
    ? appliedSearch
      ? `We couldn't find an upcoming event named "${appliedSearch}". Try another keyword, pick a different category, or create a new event.`
      : "There are no upcoming events in this category yet. Try another category or create the first one."
    : "Nothing is on the calendar right now. Reset your filters or create the first community event.";

  const successBanner = justCreated && (
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
  );

  if (compact) {
    const previewEvents = filteredEvents.slice(0, 3);

    return (
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                  Upcoming Events
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
                Find your next{" "}
                <span className="text-[#16A34A]">good deed.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Clean-ups, plantation drives, food distribution and learning
                circles happening soon near you.
              </p>
            </div>

            <Link
              href="/upcoming-events"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#164E63] transition hover:text-[#16A34A]"
            >
              View all events
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : events === null ? (
            <EventGridSkeleton />
          ) : previewEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-green-200 bg-[#FBFAF6] px-6 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
                <CalendarPlus size={26} />
              </span>
              <h3 className="mt-4 text-xl font-bold text-[#164E63]">
                No upcoming events yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Be the first to bring people together. Publish a community
                event and it will appear here instantly.
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div>
      {successBanner}

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : events === null ? (
        <EventGridSkeleton />
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-2.5 sm:flex-row"
              role="search"
            >
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSearchInput(value);
                    if (!value.trim()) setAppliedSearch("");
                  }}
                  placeholder="Search events by name…"
                  aria-label="Search events by name"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white focus:ring-4 focus:ring-green-100 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setAppliedSearch("");
                    }}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-6 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#164E63]/25"
              >
                <Search size={16} />
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <LayoutGrid size={13} />
                Categories
              </span>

              <button
                type="button"
                onClick={() => setActiveType("All")}
                aria-pressed={activeType === "All"}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeType === "All"
                    ? "border-[#16A34A] bg-[#16A34A] text-white shadow-sm shadow-green-900/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <LayoutGrid size={13} />
                All
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                    activeType === "All"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {events.length}
                </span>
              </button>

              {EVENT_TYPES.map((type) => {
                const Icon = getEventTypeIcon(type);
                const active = activeType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-[#16A34A] bg-[#16A34A] text-white shadow-sm shadow-green-900/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    <Icon size={13} />
                    {type}
                    {counts[type] ? (
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {counts[type]}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              onReset={resetFilters}
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-[#164E63]">
                    {filteredEvents.length}
                  </span>{" "}
                  of {events.length} upcoming{" "}
                  {events.length === 1 ? "event" : "events"}
                  {activeType !== "All" && (
                    <>
                      {" "}
                      in{" "}
                      <span className="font-semibold text-[#16A34A]">
                        {activeType}
                      </span>
                    </>
                  )}
                  {appliedSearch && (
                    <>
                      {" "}
                      matching{" "}
                      <span className="font-semibold text-[#164E63]">
                        “{appliedSearch}”
                      </span>
                    </>
                  )}
                </p>

                {isFiltering && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#16A34A]"
                  >
                    <RotateCcw size={13} />
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}