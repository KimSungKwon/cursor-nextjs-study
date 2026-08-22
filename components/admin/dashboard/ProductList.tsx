export type DashboardProductItem = {
  product_id: string;
  product_name: string;
  image_url: string | null;
  count: number;
};

export type ProductListProps = {
  title: string;
  products: DashboardProductItem[];
  countLabel: string;
  emptyMessage: string;
  className?: string;
};

/**
 * 베스트셀러 · 트렌딩 상품 목록 카드
 */
export const ProductList = ({
  title,
  products,
  countLabel,
  emptyMessage,
  className,
}: ProductListProps) => {
  return (
    <section
      className={className}
      style={{ backgroundColor: "var(--admin-background-default)" }}
    >
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--admin-border-default)" }}
      >
        <h2
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "26px",
            letterSpacing: "-0.36px",
            color: "var(--admin-text-primary)",
          }}
        >
          {title}
        </h2>
      </div>

      {products.length === 0 ? (
        <p
          className="px-6 py-10 text-center"
          style={{
            fontFamily: "var(--admin-font-family-body)",
            fontSize: "14px",
            lineHeight: "22px",
            color: "var(--admin-text-muted)",
          }}
        >
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex flex-col">
          {products.map((product) => (
            <li
              key={product.product_id}
              className="flex items-center gap-4 border-b px-6 py-4 last:border-b-0"
              style={{ borderColor: "var(--admin-border-light)" }}
            >
              <div
                className="size-[46px] shrink-0 overflow-hidden rounded"
                style={{ backgroundColor: "var(--admin-background-light)" }}
              >
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate"
                  style={{
                    fontFamily: "var(--admin-font-family-body)",
                    fontSize: "15px",
                    fontWeight: 700,
                    lineHeight: "21px",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  {product.product_name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--admin-font-family-body)",
                    fontSize: "13px",
                    lineHeight: "20px",
                    color: "var(--admin-text-muted)",
                  }}
                >
                  Item: #{product.product_id.slice(0, 8)}
                </p>
              </div>
              <p
                className="shrink-0 text-right"
                style={{
                  fontFamily: "var(--admin-font-family-body)",
                  fontSize: "15px",
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "var(--admin-text-primary)",
                }}
              >
                {product.count.toLocaleString()} {countLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
