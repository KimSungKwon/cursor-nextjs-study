import Link from "next/link";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { formatCommercePrice } from "@/components/commerce/types";
import {
  formatWishlistStatus,
  type WishlistItem,
} from "@/components/account/wishlist/types";

export type LikeListTableProps = {
  items: WishlistItem[];
  className?: string;
};

/**
 * 찜 목록 테이블 (피그마 Wishlist Content 285:2634)
 */
export const LikeListTable = ({ items, className }: LikeListTableProps) => {
  const headerStyle = {
    fontFamily: commerceTypography.fontFamily.body,
    fontSize: commerceTypography.caption.md.regular.fontSize,
    fontWeight: commerceTypography.fontWeight.regular,
    lineHeight: "22px",
    color: commerceColors.text.tertiary,
  } as const;

  const cellStyle = {
    fontFamily: commerceTypography.fontFamily.body,
    fontSize: commerceTypography.caption.md.regular.fontSize,
    fontWeight: commerceTypography.fontWeight.regular,
    lineHeight: "22px",
    color: commerceColors.text.secondary,
  } as const;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: commerceColors.border.light }}
          >
            <th className="pb-2 pr-4 font-normal" style={headerStyle}>
              Image
            </th>
            <th className="pb-2 pr-4 font-normal" style={headerStyle}>
              Name
            </th>
            <th className="pb-2 pr-4 font-normal" style={headerStyle}>
              Status
            </th>
            <th className="pb-2 font-normal" style={headerStyle}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const { product } = item;
            const displayPrice = product.salePrice ?? product.price;
            const href = COMMERCE_URLS.PRODUCT_DETAIL(product.id);

            return (
              <tr
                key={item.likeId}
                className="border-b"
                style={{ borderColor: commerceColors.border.light }}
              >
                <td className="py-6 pr-4 align-middle">
                  <Link
                    href={href}
                    className="block size-20 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-24 sm:w-20"
                    style={{
                      backgroundColor: commerceColors.background.light,
                      outlineColor: commerceColors.primary.main,
                    }}
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="sr-only">{product.name}</span>
                    )}
                  </Link>
                </td>
                <td className="py-6 pr-4 align-middle">
                  <Link
                    href={href}
                    className="line-clamp-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      ...cellStyle,
                      outlineColor: commerceColors.primary.main,
                    }}
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="py-6 pr-4 align-middle" style={cellStyle}>
                  {formatWishlistStatus(product.status)}
                </td>
                <td className="py-6 align-middle" style={cellStyle}>
                  {formatCommercePrice(displayPrice)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
