import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { AUTH_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { getSession } from "@/lib/auth/session";
import { getCheckoutCart } from "@/app/(commerce)/checkout/checkout-data";

function splitDisplayName(displayName: string | null): {
  firstName: string;
  lastName: string;
} {
  if (!displayName?.trim()) {
    return { firstName: "", lastName: "" };
  }
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

const stepLabelStyle = {
  fontFamily: "var(--commerce-font-family-body)",
  fontSize: "var(--commerce-body-md-regular-font-size)",
  lineHeight: "26px",
} as const;

/**
 * 결제(Checkout) 페이지 — 세션·장바구니·가격 계산 후 CheckoutForm에 전달
 */
const CheckoutPage = async () => {
  const session = await getSession();
  if (!session) {
    redirect(AUTH_URLS.LOGIN);
  }

  const { lineItems, pricing } = await getCheckoutCart(session.id);
  if (lineItems.length === 0) {
    redirect(COMMERCE_URLS.CART);
  }

  const { firstName, lastName } = splitDisplayName(session.displayName);

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-10 sm:px-6 lg:px-10 xl:px-40">
      <h1
        className="mb-6 text-center text-[var(--commerce-text-primary)]"
        style={{
          fontFamily: "var(--commerce-headline-h4-font-family)",
          fontSize: "var(--commerce-headline-h4-font-size)",
          fontWeight: "var(--commerce-headline-h4-font-weight)",
          lineHeight: "44px",
          letterSpacing: "-0.4px",
        }}
      >
        Check Out
      </h1>

      <nav
        aria-label="결제 단계"
        className="mb-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
      >
        <Link
          href={COMMERCE_URLS.CART}
          className="text-[var(--commerce-text-tertiary)] underline-offset-2 hover:underline"
          style={stepLabelStyle}
        >
          Shopping cart
        </Link>
        <span
          aria-hidden
          className="text-[var(--commerce-text-tertiary)]"
          style={stepLabelStyle}
        >
          /
        </span>
        <span
          className="font-semibold text-[var(--commerce-text-primary)]"
          style={stepLabelStyle}
          aria-current="step"
        >
          Checkout details
        </span>
        <span
          aria-hidden
          className="text-[var(--commerce-text-tertiary)]"
          style={stepLabelStyle}
        >
          /
        </span>
        <span
          className="text-[var(--commerce-text-tertiary)]"
          style={stepLabelStyle}
        >
          Order complete
        </span>
      </nav>

      <CheckoutForm
        lineItems={lineItems}
        pricing={pricing}
        customerKey={session.id}
        defaultValues={{
          firstName,
          lastName,
          email: session.email,
          phone: "",
        }}
      />
    </main>
  );
};

export default CheckoutPage;
