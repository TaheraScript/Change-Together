"use client";

import { useCallback, useEffect, useState } from "react";
import { getUpcomingEvents, type EventRecord } from "@/lib/events";
import ManageEventCard from "@/components/event/ManageEventCard";
import { toast } from "@/components/ui/toast";

export default function ManageEventPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetches the latest events from the server.
  const loadEvents = useCallback(async () => {
    try {
      const data = await getUpcomingEvents();
      setEvents(data);
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't load events",
        description: "Please check your connection and try again.",
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch(() => {
        if (!cancelled) {
          toast.add({
            type: "error",
            title: "Couldn't load events",
            description: "Please check your connection and try again.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <p className="text-sm text-slate-500">Loading your events…</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold text-[#164E63]">No events to manage</h2>
        <p className="mt-2 text-sm text-slate-500">
          You have not organised any events yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold text-[#164E63]">Manage Events</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <ManageEventCard
            key={event._id}
            event={event}
            onDeleted={loadEvents}
            onUpdated={loadEvents}
          />
        ))}
      </div>
    </div>
  );
}