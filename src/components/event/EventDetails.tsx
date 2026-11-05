import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Mail,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  formatEventDate,
  getVolunteerActivities,
  isUpcoming,
  type EventRecord,
} from "@/lib/events";
import { EVENT_TYPE_ICONS } from "@/lib/event-icons";
import EventImage from "./EventImage";
import JoinPanel from "./JoinPanel";

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#16A34A]">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-semibold leading-snug text-[#164E63]">
          {value}
        </dd>
      </div>
    </div>
  );
}

export default function EventDetails({ event }: { event: EventRecord }) {
  const TypeIcon = EVENT_TYPE_ICONS[event.type] ?? CalendarDays;
  const hasEnded = !isUpcoming(event.date);
  const thumbnail = event.thumbnailUrl?.trim();
  const activities = getVolunteerActivities(event.type);

  return (
    <section className="min-h-screen bg-[#FBFAF6] py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-[#16A34A]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <EventImage
                src={thumbnail}
                alt={event.title}
                fallback={<TypeIcon size={64} strokeWidth={1.3} />}
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A] shadow-sm backdrop-blur-sm">
                    <TypeIcon size={12} />
                    {event.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${
                      hasEnded
                        ? "bg-slate-800/85 text-white"
                        : "bg-amber-400/95 text-amber-950"
                    }`}
                  >
                    <CalendarDays size={12} />
                    {hasEnded ? "Event ended" : "Upcoming"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
                {event.title}
              </h1>

              <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                {event.location}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  About this event
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-[15px]">
                  {event.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Volunteer activity
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                    <Users size={12} />
                    Open to all volunteers
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Here&apos;s how volunteers will spend the day at this{" "}
                  {event.type.toLowerCase()} drive.
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {activities.map((activity) => (
                    <li
                      key={activity}
                      className="flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50/60 px-3.5 py-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-[#16A34A]"
                      />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-sm">
                  <Mail size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Organised by
                  </p>
                  <p className="truncate text-sm font-semibold text-[#164E63]">
                    {event.organizerEmail}
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  Organiser
                </span>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#164E63]">
                  Event details
                </h2>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                  Open to all
                </span>
              </div>

              <dl className="mt-5 space-y-4">
                <DetailRow
                  icon={CalendarDays}
                  label="Date"
                  value={formatEventDate(event.date)}
                />
                <DetailRow icon={MapPin} label="Location" value={event.location} />
                <DetailRow icon={TypeIcon} label="Category" value={event.type} />
                <DetailRow
                  icon={Tag}
                  label="Event ID"
                  value={String(event._id).slice(-8).toUpperCase()}
                />
              </dl>

              <JoinPanel
                eventId={String(event._id)}
                eventTitle={event.title}
                initialJoinCount={event.joinCount ?? 0}
                hasEnded={hasEnded}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#16A34A]">
                <CalendarPlus size={13} />
                Host your own
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug text-[#164E63]">
                Have an idea for your neighbourhood?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Publish a drive in minutes and invite volunteers to join.
              </p>
              <Link
                href="/create-event"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                Create an event
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}