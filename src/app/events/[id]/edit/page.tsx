import type { Metadata } from "next";
import EventMessage from "@/components/event/EventMessage";
import EditEventForm from "@/components/event/EditEventForm";
import { ApiError, getEvent, type EventRecord } from "@/lib/events";

export const metadata: Metadata = {
  title: "Edit Event | Change Together",
  description:
    "Update the details of a community event you organised.",
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event: EventRecord | null = null;
  let outcome: "ok" | "missing" | "error" = "ok";

  try {
    event = await getEvent(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      outcome = "missing";
    } else {
      outcome = "error";
    }
  }

  if (outcome === "missing") {
    return (
      <EventMessage
        title="Event not found"
        description="This event may have been removed, or the link is incorrect. Browse your events instead."
        retryHref="/manage-events"
      />
    );
  }

  if (outcome === "error" || !event) {
    return (
      <EventMessage
        title="Couldn't load this event"
        description="We couldn't reach the server. Please try again in a moment."
        retryHref={`/events/${id}/edit`}
      />
    );
  }

  return <EditEventForm event={event} />;
}
