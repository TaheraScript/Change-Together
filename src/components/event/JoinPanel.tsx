"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarX,
  CheckCircle2,
  Loader2,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeToUser,
} from "@/lib/auth";
import {
  ApiError,
  getJoinStatus,
  joinEvent,
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
  const user = useSyncExternalStore(
    subscribeToUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const email = user?.email ?? "";

  // Status fetched from the API, tagged with the email it belongs to
  const [fetched, setFetched] = useState<{
    email: string;
    status: JoinStatus;
  } | null>(null);
  const [joining, setJoining] = useState(false);

  // Derived during render: logged out, or data from a different user,
  // falls back to the server-rendered default. No setState in the effect needed.
  const status: JoinStatus =
    email && fetched && fetched.email === email
      ? fetched.status
      : { joined: false, joinCount: initialJoinCount, joinedAt: null };

  // Load this user's join status in the browser (depends on who is logged in)
  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    getJoinStatus(eventId, email)
      .then((result) => {
        if (cancelled) return;
        setFetched({
          email,
          status: {
            joined: result.joined,
            joinCount: result.joinCount ?? initialJoinCount,
            joinedAt: result.joinedAt ?? null,
          },
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

  const handleJoin = async () => {
    if (joining) return;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    if (joined) {
      router.push("/joined-events");
      return;
    }

    if (hasEnded) return;

    setJoining(true);
    try {
      const result = await joinEvent(eventId, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      setFetched({
        email: user.email,
        status: {
          joined: true,
          joinCount: result.joinCount,
          joinedAt: result.joinedAt,
        },
      });
      toast.add({
        type: "success",
        title: "You're in!",
        description: `You joined “${eventTitle}”. See it any time under My Events.`,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        try {
          const refreshed = await getJoinStatus(eventId, user.email);
          setFetched({ email: user.email, status: refreshed });
        } catch {
          setFetched((current) => ({
            email: user.email,
            status: {
              joined: true,
              joinCount: current?.status.joinCount ?? 0,
              joinedAt: current?.status.joinedAt ?? null,
            },
          }));
        }
        toast.add({
          type: "info",
          title: "Already joined",
          description: "You're already on the list for this event.",
        });
      } else {
        toast.add({
          type: "error",
          title: "Couldn't join the event",
          description:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    } finally {
      setJoining(false);
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
        onClick={handleJoin}
        disabled={joining || (hasEnded && !joined)}
        className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base ${
          joined
            ? "bg-[#16A34A] shadow-green-900/20 hover:bg-green-700 focus-visible:ring-green-600/25"
            : "bg-[#164E63] shadow-[#164E63]/20 hover:bg-[#0e3a4b] focus-visible:ring-[#164E63]/25"
        }`}
      >
        {joining ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Joining…
          </>
        ) : joined ? (
          <>
            <CheckCircle2 size={18} />
            Joined (click to view)
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
          You&apos;re on the list. Click the button again to see all events
          you&apos;ve joined.
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
          One click to reserve your spot. You can join this event only once.
        </p>
      )}
    </div>
  );
}