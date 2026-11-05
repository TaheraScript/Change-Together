"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EVENT_LIMITS, EVENT_TYPES, isValidEventImageUrl, type EventRecord } from "@/lib/events";
import { toast } from "@/components/ui/toast";
import { Loader2, Pencil } from "lucide-react";

type EditEventFormProps = {
  event: EventRecord;
  onUpdated?: () => void;
};

type FieldName =
  | "title"
  | "description"
  | "type"
  | "location"
  | "date"
  | "thumbnailUrl";

type FormErrors = Partial<Record<FieldName, string>>;

const inputBase =
  "h-9 w-full rounded-xl border bg-slate-50/70 pl-3 pr-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-1";
const fieldClass = (invalid: boolean) =>
  `${inputBase} ${
    invalid
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-[#16A34A] focus:ring-[#16A34A]"
  }`;

const getInitialValues = (event: EventRecord) => ({
  title: event.title,
  description: event.description,
  type: event.type,
  location: event.location,
  date: event.date,
  thumbnailUrl: event.thumbnailUrl,
});

export default function EditEventForm({ event, onUpdated }: EditEventFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => getInitialValues(event));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (field: FieldName) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
      setErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };

  // Reset the inputs to the latest event data each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setValues(getInitialValues(event));
      setErrors({});
    }
    setOpen(next);
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (values.title.trim().length < 5) {
      next.title = "Add a clear event title (at least 5 characters).";
    } else if (values.title.trim().length > EVENT_LIMITS.title) {
      next.title = `Keep the title to ${EVENT_LIMITS.title} characters or fewer.`;
    }
    if (!values.type) {
      next.type = "Select an event type.";
    } else if (
      !EVENT_TYPES.includes(values.type as (typeof EVENT_TYPES)[number])
    ) {
      next.type = "Choose a valid event type.";
    }
    if (values.location.trim().length < 3) {
      next.location = "Add a venue or area for the event.";
    } else if (values.location.trim().length > EVENT_LIMITS.location) {
      next.location = `Keep the location to ${EVENT_LIMITS.location} characters or fewer.`;
    }
    if (!values.date) {
      next.date = "Pick a date for your event.";
    } else {
      const selected = new Date(`${values.date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime())) {
        next.date = "That date doesn't look right. Please pick again.";
      } else if (values.date !== event.date && selected <= today) {
        next.date = "The event date must be in the future.";
      }
    }
    const thumbnail = values.thumbnailUrl.trim();
    if (!thumbnail) {
      next.thumbnailUrl = "Add a thumbnail image URL for your event.";
    } else if (!isValidEventImageUrl(thumbnail)) {
      next.thumbnailUrl =
        "Use a valid link starting with http(s):// or an image path.";
    }
    if (values.description.trim().length < 20) {
      next.description =
        "Describe the event in at least 20 characters so volunteers know what to expect.";
    } else if (values.description.trim().length > EVENT_LIMITS.description) {
      next.description = `Keep the description to ${EVENT_LIMITS.description} characters or fewer.`;
    }

    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as FieldName[]).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      toast.add({
        type: "error",
        title: "Check your details",
        description: nextErrors[firstInvalid],
      });
      document
        .getElementById(`edit-${event._id}-${firstInvalid}`)
        ?.focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${encodeURIComponent(event._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          type: values.type,
          location: values.location.trim(),
          date: values.date,
          thumbnailUrl: values.thumbnailUrl.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Update failed");
      }

      toast.add({
        type: "success",
        title: "Event updated",
        description: `“${values.title}” has been updated.`,
      });

      setOpen(false);
      router.refresh();
      onUpdated?.();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't update the event",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil size={15} />
        Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of “{event.title}”.
          </DialogDescription>
        </DialogHeader>
        <form
          id={`edit-event-${event._id}`}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          <div>
            <label
              htmlFor={`edit-${event._id}-title`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Event Title
            </label>
            <input
              id={`edit-${event._id}-title`}
              name="title"
              value={values.title}
              onChange={update("title")}
              maxLength={EVENT_LIMITS.title}
              aria-invalid={Boolean(errors.title)}
              className={fieldClass(Boolean(errors.title))}
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-${event._id}-type`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Event Type
            </label>
            <select
              id={`edit-${event._id}-type`}
              name="type"
              value={values.type}
              onChange={update("type")}
              aria-invalid={Boolean(errors.type)}
              className={fieldClass(Boolean(errors.type))}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.type}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-${event._id}-location`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id={`edit-${event._id}-location`}
              name="location"
              value={values.location}
              onChange={update("location")}
              maxLength={EVENT_LIMITS.location}
              aria-invalid={Boolean(errors.location)}
              className={fieldClass(Boolean(errors.location))}
            />
            {errors.location && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-${event._id}-date`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Date
            </label>
            <input
              id={`edit-${event._id}-date`}
              name="date"
              type="date"
              value={values.date}
              onChange={update("date")}
              aria-invalid={Boolean(errors.date)}
              className={fieldClass(Boolean(errors.date))}
            />
            {errors.date && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-${event._id}-thumbnailUrl`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Thumbnail URL <span className="text-[#F59E0B]">*</span>
            </label>
            <input
              id={`edit-${event._id}-thumbnailUrl`}
              name="thumbnailUrl"
              value={values.thumbnailUrl}
              onChange={update("thumbnailUrl")}
              maxLength={EVENT_LIMITS.thumbnailUrl}
              aria-invalid={Boolean(errors.thumbnailUrl)}
              className={fieldClass(Boolean(errors.thumbnailUrl))}
            />
            {errors.thumbnailUrl && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.thumbnailUrl}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-${event._id}-description`}
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id={`edit-${event._id}-description`}
              name="description"
              value={values.description}
              onChange={update("description")}
              rows={3}
              maxLength={EVENT_LIMITS.description}
              aria-invalid={Boolean(errors.description)}
              className={`${fieldClass(Boolean(errors.description))} min-h-[80px] resize-y`}
            />
            {errors.description && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={submitting} className="ml-auto">
              {submitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
