"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
import { EVENT_TYPES, type EventRecord } from "@/lib/events";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

type EditEventFormProps = {
  event: EventRecord;
  onUpdated?: () => void;
};

const inputBase =
  "h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-3 pr-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]";

const getInitialValues = (event: EventRecord) => ({
  title: event.title,
  description: event.description,
  type: event.type,
  location: event.location,
  date: event.date,
  thumbnailUrl: event.thumbnailUrl,
});

export default function EditEventForm({ event, onUpdated }: EditEventFormProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => getInitialValues(event));
  const [submitting, setSubmitting] = useState(false);

  const update =
    (field: keyof typeof values) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
    };

  // Reset the inputs to the latest event data each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) setValues(getInitialValues(event));
    setOpen(next);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/events/${event._id}`, {
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
        Edit Event
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
              htmlFor="title"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Event Title
            </label>
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={update("title")}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={values.type}
              onChange={update("type")}
              className={inputBase}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              value={values.location}
              onChange={update("location")}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={values.date}
              onChange={update("date")}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="thumbnailUrl"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={values.thumbnailUrl}
              onChange={update("thumbnailUrl")}
              className={inputBase}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={update("description")}
              rows={3}
              className={`${inputBase} min-h-[80px] resize-y`}
            />
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