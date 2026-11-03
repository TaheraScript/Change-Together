import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import RecentEvents from "@/components/home/RecentEvents";
import Gallery from "@/components/home/Gallery";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <RecentEvents />
      <Gallery />
      <Newsletter />
    </div>
  );
}
