import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import Gallery from "@/components/home/Gallery";
import UpcomingEventsList from "@/components/event/UpcomingEventsList";

export default function Home() {
  return (
    <div>
      <Hero />
      <Suspense fallback={null}>
        <UpcomingEventsList compact />
      </Suspense>
      <Gallery />
    </div>
  );
}
