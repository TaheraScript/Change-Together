import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  HeartHandshake,
  Leaf,
  Sparkles,
  Users,
} from "lucide-react";

type AuthShellProps = {
  badge: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

const HIGHLIGHTS = [
  {
    icon: HeartHandshake,
    title: "Join drives near you",
    text: "Clean-ups, plantation days, food drives and learning circles.",
  },
  {
    icon: Users,
    title: "Organise with confidence",
    text: "Publish an event in minutes and track who is coming.",
  },
  {
    icon: Leaf,
    title: "See your impact add up",
    text: "Every small action contributes to a cleaner, kinder community.",
  },
];

const STATS = [
  { value: "120+", label: "Drives hosted" },
  { value: "2.4k", label: "Volunteers" },
  { value: "12", label: "Districts" },
];

const AuthShell = ({
  badge,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) => {
  return (
    <section className="relative overflow-hidden bg-[#FBFAF6] py-8 md:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-100 blur-3xl opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-amber-100 blur-3xl opacity-60"
      />

      <div className="container relative mx-auto px-4 md:px-8">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] lg:grid-cols-[1.02fr_1fr]">
          {/* Brand panel */}
          <aside className="relative hidden overflow-hidden lg:block">
            <Image
              src="/images/gallery/village-women-procession.jpg"
              alt=""
              fill
              sizes="50vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-[#0b3644]/97 via-[#164E63]/94 to-[#16A34A]/72"
            />
            <div
              aria-hidden="true"
              className="absolute -right-16 top-16 h-56 w-56 rounded-full border border-white/15"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/5 blur-2xl"
            />

            <div className="relative flex h-full flex-col justify-between p-9 xl:p-11">
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md">
                    <Image
                      src="/images/nav-logo.png"
                      alt="Change Together logo"
                      width={44}
                      height={44}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <span className="text-base font-bold text-white">
                    Change Together
                  </span>
                </Link>

                <span className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                  <Sparkles size={12} className="text-[#FDE68A]" />
                  SDG 11 · Sustainable communities
                </span>

                <h2 className="mt-5 text-[32px] font-bold leading-[1.15] text-white xl:text-4xl">
                  Small actions.
                  <br />
                  <span className="text-[#BBF7D0]">Lasting change.</span>
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
                  Join volunteers across Bangladesh turning everyday effort into
                  cleaner neighbourhoods, fuller classrooms and stronger
                  communities.
                </p>

                <ul className="mt-7 space-y-4">
                  {HIGHLIGHTS.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/12 text-[#BBF7D0] ring-1 ring-white/15">
                        <item.icon size={15} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          {item.title}
                        </span>
                        <span className="block text-xs leading-relaxed text-white/60">
                          {item.text}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-9">
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/55">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-white/55">
                  <BadgeCheck size={13} className="text-[#BBF7D0]" />
                  Free to join · Community verified organisers
                </p>
              </div>
            </div>
          </aside>

          {/* Form panel */}
          <div className="min-w-0 px-5 py-8 sm:px-9 sm:py-10 md:px-11 md:py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 lg:hidden"
            >
              <Image
                src="/images/nav-logo.png"
                alt="Change Together logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain"
              />
              <span className="text-sm font-bold text-[#164E63]">
                Change <span className="text-[#16A34A]">Together</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-green-700">
              <Sparkles size={12} className="text-[#F59E0B]" />
              {badge}
            </span>

            <h1 className="mt-4 text-[26px] font-bold leading-tight text-[#164E63] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>

            <div className="mt-7">{children}</div>

            <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthShell;
