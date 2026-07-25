"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/commons/utils/cn";

export type ProductDetailTabId = "additional-info" | "reviews";

export interface ProductDetailTabsProps {
  defaultTab?: ProductDetailTabId;
  additionalInfoContent: ReactNode;
  reviewsContent: ReactNode;
  className?: string;
}

const TABS: { id: ProductDetailTabId; label: string }[] = [
  { id: "additional-info", label: "Additional Info" },
  { id: "reviews", label: "Reviews" },
];

export const ProductDetailTabs = ({
  defaultTab = "additional-info",
  additionalInfoContent,
  reviewsContent,
  className,
}: ProductDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState<ProductDetailTabId>(defaultTab);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-label="상품 상세 정보"
        className="flex gap-10 border-b border-[var(--commerce-border-light)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                "-mb-px border-b-2 pb-2 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2",
                isActive
                  ? "border-[var(--commerce-text-primary)] text-[var(--commerce-text-primary)]"
                  : "border-transparent text-[var(--commerce-text-tertiary)] hover:text-[var(--commerce-text-secondary)]",
              )}
              style={{
                fontFamily: "var(--commerce-button-md-font-family)",
                fontSize: "var(--commerce-button-md-font-size)",
                fontWeight: "var(--commerce-button-md-font-weight)",
                lineHeight: "32px",
                letterSpacing: "-0.4px",
                outlineColor: "var(--commerce-primary-main)",
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="pt-10">
        {activeTab === "additional-info"
          ? additionalInfoContent
          : reviewsContent}
      </div>
    </div>
  );
};
