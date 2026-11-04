import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUp,
  CalendarClock,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Upcoming Events", href: "/upcoming-events" },
  { label: "Create Event", href: "/create-event" },
  { label: "Our Gallery", href: "/#gallery" },
];

const ACCOUNT_LINKS = [
  { label: "Log in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "Joined Events", href: "/joined-events" },
  { label: "Manage Events", href: "/manage-events" },
];

const CONTACT = [
  {
    icon: Mail,
    label: "taherascript@gmail.com",
    href: "mailto:taherascript@gmail.com",
  },
  { icon: Phone, label: "+880 1310266587" },
  { icon: MapPin, label: "Dhaka, Bangladesh", href: null },
];

/* Brand marks (lucide has no brand icons, so these are the official glyphs). */
function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

const SOCIALS: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
}[] = [
  {
    icon: FacebookMark,
    label: "Facebook",
    href: "https://www.facebook.com/",
  },
  {
    icon: XMark,
    label: "X (formerly Twitter)",
    href: "https://x.com/",
  },
  {
    icon: GithubMark,
    label: "GitHub",
    href: "https://github.com/TaheraScript",
  },
  {
    icon: LinkedinMark,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/taherascript/",
  },
  {
    icon: Mail,
    label: "Email us",
    href: "mailto:taherascript@gmail.com",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0E3A4B] text-slate-300">
      {/* Thin brand gradient strip across the top edge. */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#16A34A] via-[#F59E0B] to-[#2196D9]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-green-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
      />

      <div className="relative container mx-auto px-4 py-12 md:px-8 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/images/nav-logo.png"
                alt="Change Together logo"
                width={48}
                height={48}
                className="h-11 w-11 rounded-xl bg-white/95 object-contain p-0.5"
              />
              <span className="text-base font-bold text-white">
                Change <span className="text-green-400">Together</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              A community-run calendar of clean-ups, plantation drives, food
              handouts and health camps. Small actions, lasting change.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300 ring-1 ring-white/10 transition hover:bg-green-500 hover:text-white hover:ring-green-400"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-green-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400">
              Account
            </h3>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-green-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3">
              {CONTACT.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-green-400 ring-1 ring-white/10">
                      <Icon size={14} />
                    </span>
                    <span className="break-words">{item.label}</span>
                  </>
                );

                return (
                  <li key={item.label} className="text-sm text-slate-400">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-start gap-2.5 transition hover:text-white"
                      >
                        {content}
                      </a>
                    ) : (
                      <span className="flex items-start gap-2.5">{content}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            <Link
              href="/upcoming-events"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-400"
            >
              <CalendarClock size={14} />
              Find a drive near you
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            © {year} Change Together. Made with
            <HeartHandshake size={13} className="text-green-400" />
            by volunteers, for volunteers.
          </p>

          <a
            href="#top"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Back to top
            <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}