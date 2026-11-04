import {auth} from "@/lib/auth"
import type { Metadata } from "next";
import EventDetails from "@/components/event/EventDetails";
import EventMessage from "@/components/event/EventMessage";
import { API_URL, type EventRecord } from "@/lib/events";
import { headers } from "next/headers";

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

  let event: EventRecord | null = null;
  let outcome: "ok" | "missing" | "error" = "ok";
 const token =await auth.api.getToken({
  headers: await headers(),

})
console.log(token)
  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      headers:{
        authorization: `Bearer ${token.token}`,
      },
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 400) {
      outcome = "missing";
    } else if (!res.ok) {
      outcome = "error";
    } else {
      event = await res.json();
    }
  } catch {
    outcome = "error";
  }

  if (outcome === "missing") {
    return (
      <EventMessage
        title="Event not found"
        description="This event may have been removed, or the link is incorrect. Browse the latest upcoming events instead."
      />
    );
  }

  if (outcome === "error" || !event) {
    return (
      <EventMessage
        title="Couldn't load this event"
        description="We couldn't reach the server. Please try again in a moment."
        retryHref={`/events/${id}`}
      />
    );
  }

  return <EventDetails event={event} />;
}