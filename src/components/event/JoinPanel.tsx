"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarX,
  CheckCircle2,
  Loader2,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getJoinStatus,
  joinEvent,
  leaveEvent,
  type JoinStatus,
} from "@/lib/events";
import { toast } from "@/components/ui/toast";

type JoinPanelProps = {
  eventId: string;
  eventTitle: string;
  initialJoinCount: number;
  hasEnded: boolean;
};

export default function JoinPanel({
  eventId,
  eventTitle,
  initialJoinCount,
  hasEnded,
}: JoinPanelProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;
  const email = user?.email ?? "";

  // Join count comes from the API, join state only exists for a session.
  const [status, setStatus] = useState<JoinStatus>({
    joined: false,
    joinCount: initialJoinCount,
    joinedAt: null,
  });
  const [working, setWorking] = useState(false);

  // Refresh when the visitor signs in or out, so the button matches the user.
  useEffect(() => {
    let cancelled = false;

    getJoinStatus(eventId)
      .then((result) => {
        if (cancelled) return;
        setStatus({
          joined: Boolean(email) && result.joined,
          joinCount: result.joinCount ?? initialJoinCount,
          joinedAt: result.joinedAt ?? null,
        });
      })
      .catch(() => {
        /* keep the server-rendered count if this fails */
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, email, initialJoinCount]);

  const joined = status.joined;
  const joinCount = status.joinCount ?? initialJoinCount;
  const busy = working || isPending;

  const handleClick = async () => {
    if (busy) return;

    // Joining needs a session; browsing the details page does not.
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    if (!joined && hasEnded) return;

    setWorking(true);
    try {
      if (joined) {
        // Second click leaves the event, then shows what's left.
        const result = await leaveEvent(eventId);
        setStatus(result);
        toast.add({
          type: "info",
          title: "You left the event",
          description: `You're no longer joining “${eventTitle}”.`,
        });
        router.push("/joined-events");
        return;
      }

      const result = await joinEvent(eventId);
      setStatus({
        joined: true,
        joinCount: result.joinCount,
        joinedAt: result.joinedAt,
      });

      if (result.alreadyJoined) {
        toast.add({
          type: "info",
          title: "Already joined",
          description: "You're already on the list for this event.",
        });
      } else {
        toast.add({
          type: "success",
          title: "You're in!",
          description: `You joined “${eventTitle}”. See it any time under My Events.`,
        });
      }
    } catch (error) {
      toast.add({
        type: "error",
        title: joined ? "Couldn't leave the event" : "Couldn't join the event",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-3.5 py-3 text-sm text-green-800">
        <Users size={17} className="shrink-0" />
        <span>
          <strong className="font-bold">{joinCount}</strong>{" "}
          {joinCount === 1 ? "volunteer has" : "volunteers have"} joined
        </span>
      </div>

      {joined && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          <CheckCircle2 size={12} />
          You&apos;re going
        </p>
      )}

      {hasEnded && !joined && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-amber-800">
          This event has already taken place, so joining is closed. Browse
          upcoming events to find the next drive.
        </p>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={busy || (hasEnded && !joined)}
        className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base ${
          joined
            ? "bg-[#16A34A] shadow-green-900/20 hover:bg-green-700 focus-visible:ring-green-600/25"
            : "bg-[#164E63] shadow-[#164E63]/20 hover:bg-[#0e3a4b] focus-visible:ring-[#164E63]/25"
        }`}
      >
        {working ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {joined ? "Leaving…" : "Joining…"}
          </>
        ) : joined ? (
          <>
            <CheckCircle2 size={18} />
            Joined (click to leave)
          </>
        ) : hasEnded ? (
          <>
            <CalendarX size={18} />
            Event ended
          </>
        ) : (
          <>
            <UserPlus size={18} />
            Join Event
          </>
        )}
      </button>

      {!user ? (
        <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-400">
          <LogIn size={13} className="mt-0.5 shrink-0" />
          You need to be logged in to join. We&apos;ll take you to the login
          page first.
        </p>
      ) : joined ? (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
          You&apos;re on the list. Click the button again to leave this event
          and open the events you&apos;ve joined.
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
          One click to reserve your spot. You can join this event only once.
        </p>
      )}
    </div>
  );
}
