import Image from "next/image";
import Link from "next/link";
import { COMMERCE_URLS } from "@/commons/constants/url";

/** Unsplash: gray & white sofa by the window (KbytCpI1i5I) */
const AUTH_SIDE_IMAGE =
  "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=1920&q=85";

export const AuthBrandPanel = () => {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[var(--commerce-background-light)] lg:block">
      <Image
        src={AUTH_SIDE_IMAGE}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 55vw, 0px"
        className="object-cover object-center"
      />
      {/* Figma Image Placeholder의 multiply 톤에 맞춘 은은한 오버레이 */}
      <div
        className="absolute inset-0 bg-[var(--commerce-background-light)]/25 mix-blend-multiply"
        aria-hidden
      />
      <div className="relative z-10 p-8">
        <Link
          href={COMMERCE_URLS.HOME}
          className="inline-block text-[var(--commerce-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: "var(--commerce-navigation-logo-font-family)",
            fontSize: "var(--commerce-navigation-logo-font-size)",
            fontWeight: "var(--commerce-navigation-logo-font-weight)",
            lineHeight: "var(--commerce-navigation-logo-line-height)",
            outlineColor: "var(--commerce-primary-main)",
          }}
        >
          Cursor Commerce
        </Link>
      </div>
    </section>
  );
};
