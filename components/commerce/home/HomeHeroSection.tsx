import Link from "next/link";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1440&q=80";

const ArrowRightIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M4.167 10h11.666M11.667 5.833 16.667 10l-5 4.167"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export type HomeHeroSectionProps = {
  className?: string;
};

export const HomeHeroSection = ({ className }: HomeHeroSectionProps) => {
  return (
    <section
      aria-labelledby="home-hero-title"
      className={cn(
        "grid w-full grid-cols-1 overflow-hidden lg:grid-cols-2 lg:min-h-[532px]",
        className,
      )}
    >
      <div className="relative aspect-[720/532] w-full lg:aspect-auto lg:min-h-[532px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE_URL}
          alt="스타일리시한 인테리어로 꾸민 거실"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className={cn(
          "flex flex-col justify-center bg-[var(--commerce-background-light)]",
          "px-8 py-12 sm:px-12 lg:px-[72px] lg:py-0",
        )}
      >
        <div className="flex max-w-[452px] flex-col gap-4">
          <p
            className="font-bold text-[var(--commerce-semantic-info)]"
            style={{
              fontFamily: "var(--commerce-font-family-body)",
              fontSize: "1rem",
              lineHeight: "1rem",
            }}
          >
            SALE UP TO 35% OFF
          </p>

          <h2
            id="home-hero-title"
            className="font-medium text-[var(--commerce-text-primary)]"
            style={{
              fontFamily: "var(--commerce-headline-h4-font-family)",
              fontSize:
                "clamp(1.75rem, 3.5vw, var(--commerce-headline-h4-font-size))",
              lineHeight: "var(--commerce-headline-h4-line-height)",
              letterSpacing: "-0.4px",
              fontWeight: 500,
            }}
          >
            HUNDREDS of
            <br />
            New lower prices!
          </h2>

          <p
            className="text-[var(--commerce-text-primary)]"
            style={{
              fontFamily: "var(--commerce-font-family-body)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: "2rem",
              fontWeight: 400,
            }}
          >
            It&apos;s more affordable than ever to give every room in your home
            a stylish makeover
          </p>
        </div>

        <Link
          href={COMMERCE_URLS.PRODUCTS}
          className={cn(
            "mt-4 inline-flex w-fit items-center gap-1 border-b border-[var(--commerce-text-primary)] pb-0.5",
            "text-[var(--commerce-text-primary)] transition-opacity hover:opacity-70",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--commerce-text-primary)]",
          )}
          style={{
            fontFamily: "var(--commerce-font-family-body)",
            fontSize: "1rem",
            lineHeight: "1.75rem",
            fontWeight: 500,
            letterSpacing: "-0.4px",
          }}
        >
          Shop Now
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
};
