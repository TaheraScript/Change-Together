"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";
import UserInfo from "@/components/UserInfo";

const Navbar = () => {
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

          <UserInfo />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
