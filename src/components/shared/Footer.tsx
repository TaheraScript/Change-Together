import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  CalendarClock,
  Globe,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Send,
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
    label: "volunteer@changetogether.org",
    href: "mailto:volunteer@changetogether.org",
  },
  { icon: Phone, label: "+880 1700 000 000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Dhaka, Bangladesh", href: null },
];

const SOCIALS = [
  { icon: Globe, label: "Facebook", href: "https://www.facebook.com/" },
  { icon: Send, label: "X (Twitter)", href: "https://x.com/" },
  { icon: Mail, label: "Instagram", href: "https://www.instagram.com/" },
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

            <div className="mt-5 flex items-center gap-2">
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
                    <Icon size={16} />
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
