import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CalendarPlus, LayoutDashboard, UserRound } from "lucide-react";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Your Profile | Change Together",
  description:
    "View your account and update your display name and profile picture.",
};

const quickLinks = [
  {
    href: "/manage-events",
    label: "Manage your events",
    description: "Edit or cancel drives you organised.",
    icon: LayoutDashboard,
  },
  {
    href: "/joined-events",
    label: "Joined events",
    description: "Everything you signed up for.",
    icon: CalendarCheck,
  },
  {
    href: "/create-event",
    label: "Create an event",
    description: "Start a new community drive.",
    icon: CalendarPlus,
  },
];

export default function ProfilePage() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 max-w-xl md:mb-10">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            Your account
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#164E63] sm:text-3xl md:text-4xl">
            Your <span className="text-[#16A34A]">profile.</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Keep your name and profile picture up to date so organisers and
            volunteers know who they&apos;re working with.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ProfileView />

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#16A34A]">
                <UserRound size={13} />
                Quick links
              </p>
              <ul className="mt-4 space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-green-200 hover:bg-green-50"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-sm">
                        <link.icon size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[#164E63] group-hover:text-green-700">
                          {link.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
