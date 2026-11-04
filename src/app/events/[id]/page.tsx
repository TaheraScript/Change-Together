import type { Metadata } from "next";
import EventDetails from "@/components/event/EventDetails";
import EventMessage from "@/components/event/EventMessage";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import { lookupEvent } from "@/lib/events-server";

export const metadata: Metadata = {
  title: "Event Details | Change Together",
  description:
    "See the full details of a community event and join with one click.",
};

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Public page: Mongo first so it renders without the external API.
  // The token is only used for the REST fallback, and is null for guests.
  const lookup = await lookupEvent(id, { token: await getTokenFromServer() });

  if (lookup.status === "missing") {
    return (
      <EventMessage
        title="Event not found"
        description="This event may have been removed, or the link is incorrect. Browse the latest upcoming events instead."
      />
    );
  }

  if (lookup.status === "unavailable") {
    return (
      <EventMessage
        title="Couldn't load this event"
        description="We couldn't reach the server. Please try again in a moment."
        retryHref={`/events/${id}`}
      />
    );
  }

  return <EventDetails event={lookup.event} />;
}
