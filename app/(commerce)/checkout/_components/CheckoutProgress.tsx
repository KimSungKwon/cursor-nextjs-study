import { HiCheck } from "react-icons/hi2";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { cn } from "@/commons/utils/cn";

export type CheckoutProgressStep = "cart" | "checkout" | "complete";

type CheckoutProgressProps = {
  current: CheckoutProgressStep;
  className?: string;
};

const STEPS: { id: CheckoutProgressStep; label: string; index: number }[] = [
  { id: "cart", label: "Shopping cart", index: 1 },
  { id: "checkout", label: "Checkout details", index: 2 },
  { id: "complete", label: "Order complete", index: 3 },
];

function stepRank(step: CheckoutProgressStep): number {
  return STEPS.find((s) => s.id === step)?.index ?? 0;
}

/**
 * Figma Order Complete Process 스텝퍼 (node 61:11650)
 */
export function CheckoutProgress({ current, className }: CheckoutProgressProps) {
  const currentRank = stepRank(current);

  return (
    <nav
      aria-label="결제 단계"
      className={cn(
        "flex w-full max-w-[832px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      {STEPS.map((step) => {
        const done = step.index < currentRank;
        const active = step.id === current;
        const accent = done
          ? commerceColors.semantic.success
          : active
            ? commerceColors.neutral.n06
            : commerceColors.text.tertiary;
        const circleBg = done
          ? commerceColors.semantic.success
          : active
            ? commerceColors.neutral.n06
            : commerceColors.background.subtle;

        return (
          <div
            key={step.id}
            className="flex min-w-0 flex-1 flex-col gap-[26px]"
            aria-current={active ? "step" : undefined}
          >
            <div className="flex items-center gap-[17px]">
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: circleBg }}
                aria-hidden
              >
                {done ? (
                  <HiCheck size={24} color={commerceColors.text.inverse} />
                ) : (
                  <span
                    style={{
                      fontFamily: commerceTypography.fontFamily.body,
                      fontSize: commerceTypography.body.md.semibold.fontSize,
                      fontWeight: commerceTypography.fontWeight.semibold,
                      lineHeight: "26px",
                      color: commerceColors.text.inverse,
                    }}
                  >
                    {step.index}
                  </span>
                )}
              </span>
              <span
                className="truncate"
                style={{
                  fontFamily: commerceTypography.fontFamily.body,
                  fontSize: commerceTypography.body.md.semibold.fontSize,
                  fontWeight: commerceTypography.fontWeight.semibold,
                  lineHeight: "26px",
                  color: accent,
                }}
              >
                {step.label}
              </span>
            </div>
            <div
              className="h-px w-full"
              style={{
                backgroundColor: done
                  ? commerceColors.semantic.success
                  : active
                    ? commerceColors.primary.main
                    : commerceColors.border.light,
              }}
              aria-hidden
            />
          </div>
        );
      })}
    </nav>
  );
}
