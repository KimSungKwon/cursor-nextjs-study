import {
  getBestSellingProducts,
  getRecentOrders,
  getTodayOrderCount,
  getTrendingProducts,
} from "@/app/admin/queries";
import { ProductList } from "@/components/admin/dashboard/ProductList";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { requireAdminAccess } from "@/lib/auth/admin";

const AdminHomePage = async () => {
  await requireAdminAccess();

  const [
    todayOrderCount,
    bestSellingProducts,
    trendingProducts,
    recentOrders,
  ] = await Promise.all([
    getTodayOrderCount(),
    getBestSellingProducts(10),
    getTrendingProducts(10),
    getRecentOrders(10),
  ]);

  const bestSellingItems = bestSellingProducts.map((product) => ({
    product_id: product.product_id,
    product_name: product.product_name,
    image_url: product.image_url,
    count: product.total_quantity,
  }));

  const trendingItems = trendingProducts.map((product) => ({
    product_id: product.product_id,
    product_name: product.product_name,
    image_url: product.image_url,
    count: product.like_count,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1
        style={{
          fontFamily: "var(--admin-font-family-heading)",
          fontSize: "20px",
          fontWeight: 500,
          lineHeight: "22px",
          color: "var(--admin-text-primary)",
        }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <StatCard value={todayOrderCount} label="Today Order" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductList
          className="overflow-hidden rounded-2xl lg:col-span-1"
          title="Best Selling Products"
          products={bestSellingItems}
          countLabel="판매량"
          emptyMessage="판매 데이터가 없습니다."
        />
        <ProductList
          className="overflow-hidden rounded-2xl lg:col-span-1"
          title="Trending Products"
          products={trendingItems}
          countLabel="좋아요"
          emptyMessage="좋아요 데이터가 없습니다."
        />
      </div>

      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
};

export default AdminHomePage;
