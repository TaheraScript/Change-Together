"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowRightToLine,
  CalendarCheck,
  CalendarClock,
  LogOut,
  Plus,
} from "lucide-react";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  logoutUser,
  subscribeToUser,
  type SessionUser,
} from "@/lib/auth";
import { toast } from "@/components/ui/toast";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function UserAvatar({ user }: { user: SessionUser }) {
  const [failed, setFailed] = useState(false);
  const photo = user.photoURL;
  const showPhoto = Boolean(photo) && !failed;

  return (
    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-green-500 bg-green-50 text-xs font-bold text-[#164E63]">
      {showPhoto && photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={user.displayName}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsOf(user.displayName)
      )}
    </span>
  );
}

const Navbar = () => {
  const router = useRouter();
  const user = useSyncExternalStore(
    subscribeToUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const handleLogout = () => {
    logoutUser();
    toast.add({
      type: "success",
      title: "You're signed out",
      description: "Your events stay saved. Log back in any time.",
    });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex items-center justify-between gap-2 px-4 py-2.5 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Image
            src="/images/nav-logo.png"
            alt="Change Together logo"
            width={48}
            height={48}
            preload
            className="h-10 w-10 rounded-xl object-contain sm:h-11 sm:w-11"
          />

          <div>
            <h1 className="text-[15px] font-bold leading-tight text-[#164E63]">
              Change <span className="text-[#16A34A]">Together</span>
            </h1>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Small Actions, Lasting Change
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
          <Link
            href="/upcoming-events"
            aria-label="Upcoming Events"
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <CalendarClock size={18} strokeWidth={1.8} />
            <span className="hidden sm:inline">Upcoming Events</span>
          </Link>

          <Link
            href="/create-event"
            className="hidden items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 sm:flex"
          >
            <Plus size={17} strokeWidth={2} />
            <span className="hidden md:inline">Create Event</span>
          </Link>

          {user && (
            <Link
              href="/joined-events"
              aria-label="My joined events"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-700 md:flex"
            >
              <CalendarCheck size={18} strokeWidth={1.8} />
              <span className="hidden lg:inline">My Events</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 py-0.5 pl-0.5 pr-2.5">
                <UserAvatar key={user.photoURL ?? user.email} user={user} />
                <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 sm:block">
                  {user.displayName.split(" ")[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[#164E63] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#164E63]/20 transition hover:bg-[#0e3a4b]"
            >
              <ArrowRightToLine size={17} strokeWidth={1.9} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
