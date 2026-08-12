export const REVIEWS_PAGE_SIZE = 5;

export type MyReviewProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type MyReviewItem = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: string;
  product: MyReviewProduct;
};

export type MyReviewsListResult = {
  items: MyReviewItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};
