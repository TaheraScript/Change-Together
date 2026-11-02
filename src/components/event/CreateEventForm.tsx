"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Send,
  Sparkles,
  Tag,
  Type,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeToUser,
} from "@/lib/auth";
import {
  EVENT_TYPES,
  addEvent,
  toDateInputValue,
  type CommunityEvent,
} from "@/lib/events";

type FormValues = {
  title: string;
  type: string;
  date: string;
  location: string;
  thumbnailUrl: string;
  description: string;
};

type FieldName = keyof FormValues;
type FormErrors = Partial<Record<FieldName, string>>;

const INITIAL_VALUES: FormValues = {
  title: "",
  type: "",
  date: "",
  location: "",
  thumbnailUrl: "",
  description: "",
};

const QUICK_PHOTOS = [
  { label: "Cleanup", url: "/images/gallery/lake-cleanup.jpg" },
  { label: "Plantation", url: "/images/gallery/community-garden.jpg" },
  { label: "Food Drive", url: "/images/gallery/rice-distribution.jpg" },
  { label: "Education", url: "/images/gallery/classroom-drawings.jpg" },
  { label: "Community", url: "/images/gallery/village-women-procession.jpg" },
];

const inputBase =
  "h-11 w-full rounded-xl border bg-slate-50/70 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4";
const inputState = (invalid: boolean) =>
  invalid
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-[#16A34A] focus:ring-green-100";

const iconBase =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#16A34A]";

export default function CreateEventForm() {
  const router = useRouter();
  const user = useSyncExternalStore(
    subscribeToUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedEvent, setSavedEvent] = useState<CommunityEvent | null>(null);
  const [storageError, setStorageError] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInputRef.current?.setAttribute("min", toDateInputValue(tomorrow));

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const update =
    (field: FieldName) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (values.title.trim().length < 5) {
      nextErrors.title = "Add a clear event title (at least 5 characters).";
    }
    if (!values.type) {
      nextErrors.type = "Select an event type.";
    }
    if (!values.date) {
      nextErrors.date = "Pick a date for your event.";
    } else {
      const selected = new Date(`${values.date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime())) {
        nextErrors.date = "That date doesn't look right. Please pick again.";
      } else if (selected <= today) {
        nextErrors.date = "The event date must be in the future.";
      }
    }
    if (values.location.trim().length < 3) {
      nextErrors.location = "Add a venue or area for the event.";
    }
    if (!values.thumbnailUrl.trim()) {
      nextErrors.thumbnailUrl = "Add a thumbnail image URL.";
    } else if (
      !/^https?:\/\/.+/i.test(values.thumbnailUrl.trim()) &&
      !values.thumbnailUrl.trim().startsWith("/")
    ) {
      nextErrors.thumbnailUrl =
        "Use a valid link starting with http(s):// or an image path.";
    }
    if (values.description.trim().length < 20) {
      nextErrors.description =
        "Describe the event in at least 20 characters so volunteers know what to expect.";
    }

    return nextErrors;
  };

  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch('http://localhost:3000/create-event',{
      method:'POST',
      headers:{
        'Content-Type': 'application/json'
      },
     body: JSON.stringify(values)
    })
    const data = await res.json()
    console.log(data)
    setStorageError("");

    const nextErrors = validate();
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors).find(
      (key) => nextErrors[key as FieldName],
    );
    if (firstInvalid) {
      document
        .getElementById(firstInvalid)
        ?.focus({ preventScroll: true });
      document
        .getElementById(firstInvalid)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!user) {
      router.push("/login?next=/create-event");
      return;
    }

    setSubmitting(true);
    try {
      const created = addEvent({
        title: values.title.trim(),
        description: values.description.trim(),
        type: values.type as CommunityEvent["type"],
        thumbnailUrl: values.thumbnailUrl.trim(),
        location: values.location.trim(),
        date: values.date,
        organizerEmail: user.email,
      });
      setSavedEvent(created);
      setSubmitting(false);
      redirectTimer.current = setTimeout(() => {
        router.push("/upcoming-events?created=1");
      }, 1400);
    } catch {
      setSubmitting(false);
      setStorageError(
        "We couldn't save your event on this device. Please try again.",
      );
    }
  };

  const disabled = submitting || Boolean(savedEvent);

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-9 text-center shadow-xl shadow-slate-900/5 sm:px-10 sm:py-11">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
            <LogIn size={26} />
          </span>
          <h1 className="mt-5 text-2xl font-bold leading-tight text-[#164E63] sm:text-3xl">
            Log in to create an event
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Only signed-in volunteers can publish a drive. Log in to your
            account, or create one in a few seconds.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/login?next=/create-event"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
            >
              <LogIn size={17} />
              Log in
            </Link>
            <Link
              href="/register?next=/create-event"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
            >
              <UserPlus size={17} />
              Create account
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Your email is attached to every event you publish.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
        <div className="border-b border-slate-100 bg-gradient-to-br from-green-50/80 via-white to-white px-6 py-7 sm:px-9 sm:py-9">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-green-700">
            <Sparkles size={13} className="text-[#F59E0B]" />
            Social Service Drive
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
            Create a Community <span className="text-[#16A34A]">Event</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Organise a clean-up, tree plantation, donation drive or learning
            session for your neighbourhood.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 px-6 py-7 sm:px-9 sm:py-8"
        >
          {savedEvent && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">
                  “{savedEvent.title}” was published successfully.
                </p>
                <p className="text-green-700/80">
                  Taking you to the Upcoming Events page…
                </p>
              </div>
            </div>
          )}

          {storageError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <XCircle size={18} className="mt-0.5 shrink-0" />
              {storageError}
            </div>
          )}

          {/* Event title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Event Title <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="group relative">
              <Type size={17} className={iconBase} />
              <input
                id="title"
                name="title"
                type="text"
                value={values.title}
                onChange={update("title")}
                placeholder="e.g. Winter Clothes Distribution — Mirpur 10, Dhaka"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                autoComplete="off"
                disabled={disabled}
                className={`${inputBase} ${inputState(Boolean(errors.title))} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              />
            </div>
            {errors.title && (
              <p
                id="title-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Event type */}
            <div>
              <label
                htmlFor="type"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Event Type <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="group relative">
                <Tag size={17} className={iconBase} />
                <select
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={update("type")}
                  aria-invalid={Boolean(errors.type)}
                  aria-describedby={errors.type ? "type-error" : undefined}
                  disabled={disabled}
                  className={`${inputBase} ${inputState(Boolean(errors.type))} appearance-none pr-10 ${values.type ? "text-slate-800" : "text-slate-400"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <option value="" disabled>
                    Select an event type
                  </option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type} className="text-slate-800">
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
              {errors.type && (
                <p
                  id="type-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-red-600"
                >
                  {errors.type}
                </p>
              )}
            </div>

            {/* Event date */}
            <div>
              <label
                htmlFor="date"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Event Date <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="group relative">
                <CalendarDays size={17} className={iconBase} />
                <input
                  id="date"
                  name="date"
                  type="date"
                  ref={dateInputRef}
                  value={values.date}
                  onChange={update("date")}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : "date-hint"}
                  disabled={disabled}
                  className={`${inputBase} ${inputState(Boolean(errors.date))} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                />
              </div>
              {errors.date ? (
                <p
                  id="date-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-red-600"
                >
                  {errors.date}
                </p>
              ) : (
                <p id="date-hint" className="mt-1.5 text-xs text-slate-400">
                  The event date must be after today.
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Location / Venue <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="group relative">
              <MapPin size={17} className={iconBase} />
              <input
                id="location"
                name="location"
                type="text"
                value={values.location}
                onChange={update("location")}
                placeholder="e.g. Dhanmondi Lake, Road 8, Dhaka"
                aria-invalid={Boolean(errors.location)}
                aria-describedby={
                  errors.location ? "location-error" : undefined
                }
                autoComplete="off"
                disabled={disabled}
                className={`${inputBase} ${inputState(Boolean(errors.location))} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              />
            </div>
            {errors.location && (
              <p
                id="location-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.location}
              </p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label
              htmlFor="thumbnailUrl"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Thumbnail Image URL <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="group relative">
              <ImageIcon size={17} className={iconBase} />
              <input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                value={values.thumbnailUrl}
                onChange={update("thumbnailUrl")}
                placeholder="https://images.example.com/event.jpg"
                aria-invalid={Boolean(errors.thumbnailUrl)}
                aria-describedby={
                  errors.thumbnailUrl ? "thumbnailUrl-error" : "thumbnail-hint"
                }
                autoComplete="off"
                disabled={disabled}
                className={`${inputBase} ${inputState(Boolean(errors.thumbnailUrl))} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              />
            </div>
            {errors.thumbnailUrl ? (
              <p
                id="thumbnailUrl-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.thumbnailUrl}
              </p>
            ) : (
              <p id="thumbnail-hint" className="mt-1.5 text-xs text-slate-400">
                Or pick one of the ready-made photos below.
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-medium text-slate-400">
                Quick photo presets:
              </span>
              {QUICK_PHOTOS.map((preset) => {
                const active = values.thumbnailUrl === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setValues((current) => ({
                        ...current,
                        thumbnailUrl: preset.url,
                      }));
                      setErrors((current) => {
                        if (!current.thumbnailUrl) return current;
                        const next = { ...current };
                        delete next.thumbnailUrl;
                        return next;
                      });
                    }}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-[#16A34A] text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Event Description <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="group relative">
              <AlignLeft
                size={17}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400 transition group-focus-within:text-[#16A34A]"
              />
              <textarea
                id="description"
                name="description"
                value={values.description}
                onChange={update("description")}
                maxLength={700}
                rows={5}
                placeholder="Explain the purpose of the drive, volunteers needed, items being distributed or tasks to complete…"
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? "description-error"
                    : "description-hint"
                }
                disabled={disabled}
                className={`min-h-32 w-full resize-y rounded-xl border bg-slate-50/70 py-3 pl-11 pr-3.5 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${inputState(Boolean(errors.description))} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              />
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums text-slate-400">
                {values.description.length}/700
              </span>
            </div>
            {errors.description ? (
              <p
                id="description-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.description}
              </p>
            ) : (
              <p id="description-hint" className="mt-1.5 text-xs text-slate-400">
                A clear description helps volunteers decide to join.
              </p>
            )}
          </div>

          {/* Organizer email */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
              <Lock size={14} className="text-[#16A34A]" />
              Organizer email attached:
            </span>
            <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
              {user.email}
            </span>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#164E63] text-sm font-semibold text-white shadow-lg shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#164E63]/25 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing event…
              </>
            ) : savedEvent ? (
              <>
                <CheckCircle2 size={18} />
                Event published
              </>
            ) : (
              <>
                <Send size={17} />
                Publish Event
              </>
            )}
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-400">
            By publishing, you confirm the details are accurate and that you
            are the organiser of this community event.
          </p>
        </form>
      </div>
    </div>
  );
}
