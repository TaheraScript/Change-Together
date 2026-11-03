"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Mail, Send, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { isValidEmail } from "@/lib/utils";

const PERKS = [
  "One short email a week",
  "New drives near you",
  "No spam, unsubscribe anytime",
];

export default function Newsletter() {
  const [email, setEmail] = useState("");

  // Design-only section: nothing is stored or sent to a server.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      toast.add({
        type: "error",
        title: "Check your email",
        description: "Enter a valid email address so we can reach you.",
      });
      return;
    }

    toast.add({
      type: "success",
      title: "You're on the list 🎉",
      description: "We'll send the next round of local drives your way.",
    });
    setEmail("");
  };

  return (
    <section id="newsletter" className="bg-white pb-14 md:pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#164E63] via-[#12556b] to-[#0e3a4b] px-6 py-10 shadow-xl shadow-[#164E63]/20 md:px-12 md:py-14">
          {/* Decorative glows + dot grid keep the block from feeling flat. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-green-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:radial-gradient(circle,#ffffff_1px,transparent_1px)] [background-size:22px_22px]"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-green-200 ring-1 ring-white/15">
                <Sparkles size={13} />
                The Change Letter
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                Good deeds, delivered{" "}
                <span className="text-green-300">every Friday.</span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-200 md:text-base">
                Get the newest clean-ups, plantation drives and donation
                appeals in your inbox — plus small stories from the people who
                showed up.
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200"
                  >
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-green-300"
                    />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm md:p-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <label
                  htmlFor="newsletter-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-200"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/20 bg-white/95 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-300 focus:ring-4 focus:ring-green-300/30"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300/40"
                >
                  Subscribe
                  <Send size={16} />
                </button>

                <p className="text-center text-[11px] leading-relaxed text-slate-300">
                  Join 2,400+ volunteers. We only email when there&apos;s
                  something worth showing up for.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
