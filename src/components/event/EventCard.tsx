"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  formatEventDate,
  formatJoinedDate,
  type EventRecord,
} from "@/lib/events";
import { EVENT_TYPE_ICONS } from "@/lib/event-icons";

type EventCardProps = {
  event: EventRecord;
  joinedAt?: string;
};

export default function EventCard({ event, joinedAt }: EventCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const TypeIcon = EVENT_TYPE_ICONS[event.type] ?? CalendarDays;
  const eventId = event._id;
  const thumbnail = event.thumbnailUrl?.trim();
  const hasImage = Boolean(thumbnail) && !imageFailed;

  const handleRetry = () => {
    setImageFailed(false);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-lg hover:shadow-slate-900/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={event.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 text-[#16A34A]">
            {thumbnail && retryCount < 3 ? (
              <button
                type="button"
                onClick={handleRetry}
                aria-label="Retry loading image"
                className="flex h-full w-full items-center justify-center p-4"
              >
                <RefreshCw size={34} strokeWidth={1.6} />
              </button>
            ) : (
              <TypeIcon size={44} strokeWidth={1.4} />
            )}
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A] shadow-sm backdrop-blur-sm">
          <TypeIcon size={12} />
          {event.type}
        </span>

        {joinedAt && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <CheckCircle2 size={12} />
            Joined
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#164E63]">
          <CalendarDays size={14} className="text-[#F59E0B]" />
          {formatEventDate(event.date)}
        </p>

        <h3 className="mt-2 text-lg font-bold leading-snug text-[#164E63]">
          <Link
            href={`/events/${eventId}`}
            className="transition hover:text-[#16A34A]"
          >
            {event.title}
          </Link>
        </h3>

        <p className="mt-1.5 inline-flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin size={15} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{event.location}</span>
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>

        {joinedAt && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
            <CheckCircle2 size={13} />
            You joined on {formatJoinedDate(joinedAt)}
          </p>
        )}

        <div className="mt-auto border-t border-slate-100 pt-3.5">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{event.organizerEmail}</span>
            <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
              Organiser
            </span>
          </p>

          <Link
            href={`/events/${eventId}`}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#164E63] text-sm font-semibold text-white shadow-sm shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#164E63]/25"
          >
            View Event
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
