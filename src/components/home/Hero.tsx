import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

/* Small SDG-inspired mark: one circular icon split into a few cause-colored
   segments (green / blue / amber) instead of all 17 SDG tiles. */
function SdgInspiredMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#16A34A"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="14 6"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#2196D9"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="10 12"
        strokeDashoffset="-15"
        transform="rotate(180 12 12)"
      />
      <circle cx="12" cy="12" r="2.6" fill="#F59E0B" />
    </svg>
  );
}

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#FBFAF6]">
      {/* subtle green decorative shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-green-100 blur-3xl opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-[8%] hidden h-40 w-40 rounded-full border border-green-200 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 left-[42%] hidden h-2.5 w-2.5 rounded-full bg-amber-300 lg:block"
      />

      <div className="relative mx-auto container px-4 py-14 md:px-8 md:py-20 lg:py-24">
        <div className="items-center gap-10 grid lg:grid-cols-2 lg:gap-16">
          {/* Left: copy + CTAs */}
          <div>
            <div className="animate-hero-up inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 shadow-sm">
              <SdgInspiredMark className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-700 sm:text-xs">
                Together for a better tomorrow
              </span>
            </div>

            <h1 className="animate-hero-up hero-delay-1 mt-5 text-4xl font-bold leading-tight text-[#164E63] sm:text-5xl lg:text-6xl">
              Small Actions.{" "}
              <span className="relative whitespace-nowrap text-[#16A34A]">
                Big Impact.
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-1.5 w-24 rounded-full bg-amber-400 sm:w-32"
                />
              </span>
            </h1>

            <p className="animate-hero-up hero-delay-2 mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">
              Join hands with people who care. Discover local initiatives,
              create meaningful events, and make a positive difference in your
              community.
            </p>

            <div className="animate-hero-up hero-delay-3 mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/upcoming-events"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#164E63] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] sm:px-7 sm:text-base"
              >
                Explore Events
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/create-event"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#16A34A]/70 bg-transparent px-6 py-3 text-sm font-semibold text-[#16A34A] transition hover:bg-green-50 sm:px-7 sm:text-base"
              >
                Create an Event
              </Link>
            </div>

            <div className="animate-hero-up hero-delay-4 mt-8 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              <span>Community</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Collaboration</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Positive Change</span>
            </div>
          </div>

          {/* Right: hero image + floating card (below text on mobile) */}
          <div className="animate-hero-in hero-delay-3 relative mt-4 lg:mt-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-green-900/15 ring-1 ring-black/5 sm:aspect-[16/11]">
              <Image
                src="/images/hero-volunteers.jpg"
                alt="Volunteers in matching shirts handing out aid to the community"
                fill
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* floating card over the hero image */}
            <div className="animate-hero-up hero-delay-5 animate-hero-float absolute -bottom-6 left-4 flex max-w-xs items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur sm:left-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <HeartHandshake size={22} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Every action creates an impact.
                </p>
                <p className="text-xs text-slate-500">
                  12,400+ volunteers already joined
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
