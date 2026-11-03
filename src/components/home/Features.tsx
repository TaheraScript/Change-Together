import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";

type Feature = {
  icon: typeof CalendarPlus;
  title: string;
  description: string;
  /** Tailwind classes for the icon tile. */
  tile: string;
};

const FEATURES: Feature[] = [
  {
    icon: CalendarPlus,
    title: "Create a drive in minutes",
    description:
      "Publish a clean-up, plantation, donation or health camp with a date, venue and cover photo — no forms to chase down.",
    tile: "bg-green-50 text-[#16A34A] ring-green-100",
  },
  {
    icon: Users,
    title: "Join with one tap",
    description:
      "Volunteers join instantly and see the same live headcount, so you always know how many helping hands to expect.",
    tile: "bg-sky-50 text-[#0E7490] ring-sky-100",
  },
  {
    icon: HeartHandshake,
    title: "Local causes first",
    description:
      "Every event is organised by a neighbour, for the neighbourhood — browse by cause and pick what you care about.",
    tile: "bg-amber-50 text-[#B45309] ring-amber-100",
  },
  {
    icon: ShieldCheck,
    title: "Safe, private accounts",
    description:
      "Email or Google sign-in with hashed passwords and server-side sessions. Your details never end up in the wrong hands.",
    tile: "bg-teal-50 text-[#164E63] ring-teal-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A] ring-1 ring-green-100">
            Why people stay
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#164E63] md:text-4xl">
            Built for people who show up
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            Change Together keeps the boring parts out of volunteering, so the
            only thing left to do is the good part.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.tile}`}
                >
                  <Icon size={21} strokeWidth={1.9} />
                </span>

                <h3 className="mt-4 text-base font-bold leading-snug text-[#164E63]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center">
          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A] transition hover:text-green-700 hover:underline"
          >
            Browse what&apos;s happening near you
            <ArrowRight size={16} />
          </Link>
        </p>
      </div>
    </section>
  );
}
