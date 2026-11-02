import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type GalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/*
 * Real, free-licence community-service photography (Pexels).
 * Mixed portrait and landscape sizes keep the masonry wall alive.
 */
const gallery: GalleryItem[] = [
  {
    src: "/images/gallery/lake-cleanup.jpg",
    alt: "Two volunteers in gloves picking litter into a black bag beside a lake",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/schoolboys-bicycle.jpg",
    alt: "Four schoolboys smiling beside a bicycle in front of their classroom",
    width: 1200,
    height: 1376,
  },
  {
    src: "/images/gallery/rice-distribution.jpg",
    alt: "Volunteers handing bags of rice to women at a relief distribution point",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/health-camp.jpg",
    alt: "A health worker checking an elderly woman's blood pressure at a community camp",
    width: 1200,
    height: 938,
  },
  {
    src: "/images/gallery/women-cooperative.jpg",
    alt: "Women working together at sewing machines inside a tailoring cooperative",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/schoolboys-group.jpg",
    alt: "A group of schoolchildren in uniform sitting together on the ground",
    width: 1200,
    height: 1800,
  },
  {
    src: "/images/gallery/community-garden.jpg",
    alt: "Volunteers pushing wheelbarrows across a community garden plot",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/blood-donation.jpg",
    alt: "A volunteer donating blood at an outdoor donation camp",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/village-women-procession.jpg",
    alt: "Village women walking together across a field in colourful saris",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/classroom-drawings.jpg",
    alt: "Children holding up their drawings in a bright community classroom",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/relief-bag-elder.jpg",
    alt: "An elderly man carrying a relief bag of food through a busy street",
    width: 1200,
    height: 1800,
  },
  {
    src: "/images/gallery/volunteers-aid-boxes.jpg",
    alt: "Volunteers in white shirts sorting medicine and aid boxes for distribution",
    width: 1600,
    height: 1067,
  },
  {
    src: "/images/gallery/village-women.jpg",
    alt: "Women from a village community sitting together at an awareness session",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/rural-classroom.jpg",
    alt: "Students seated in a rural classroom during a lesson",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/gallery/village-children-mentor.jpg",
    alt: "A young mentor sitting with children at a village learning session",
    width: 1200,
    height: 800,
  },
];

const Gallery = () => {
  return (
    <section id="gallery" className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="animate-hero-up mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#16A34A] sm:text-xs">
                Gallery
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#164E63] sm:text-4xl">
              Our community in{" "}
              <span className="text-[#16A34A]">action.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Clean-ups, learning circles, health camps, relief distribution and
              women-led cooperatives — real photographs from the work our
              volunteers do.
            </p>
          </div>

          <Link
            href="/upcoming-events"
            className="group hidden items-center gap-2 text-sm font-semibold text-[#164E63] transition hover:text-[#16A34A] sm:inline-flex"
          >
            View all events
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="columns-2 gap-2.5 sm:columns-3 md:gap-3 lg:columns-4">
          {gallery.map((item, index) => (
            <figure
              key={item.src}
              className="animate-gallery-item group relative mb-2.5 break-inside-avoid overflow-hidden rounded-lg bg-slate-100 ring-1 ring-black/5 md:mb-3"
              style={{ animationDelay: `${Math.min(index * 45, 320)}ms` }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
                className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </figure>
          ))}
        </div>

        <Link
          href="/upcoming-events"
          className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#164E63] transition hover:text-[#16A34A] sm:hidden"
        >
          View all events
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
};

export default Gallery;
