export type StatCardProps = {
  value: string | number;
  label: string;
};

/**
 * 대시보드 통계 카드
 */
export const StatCard = ({ value, label }: StatCardProps) => {
  return (
    <article
      className="rounded-2xl p-6"
      style={{ backgroundColor: "var(--admin-background-default)" }}
    >
      <h3
        style={{
          fontFamily: "var(--admin-font-family-body)",
          fontSize: "18px",
          fontWeight: 600,
          lineHeight: "26px",
          letterSpacing: "-0.36px",
          color: "var(--admin-text-primary)",
        }}
      >
        {label}
      </h3>
      <p
        className="mt-4"
        style={{
          fontFamily: "var(--admin-font-family-body)",
          fontSize: "32px",
          fontWeight: 700,
          lineHeight: "32px",
          letterSpacing: "-0.64px",
          color: "var(--admin-text-primary)",
        }}
      >
        {value}
      </p>
    </article>
  );
};
