export const REVIEW_PAGE_SIZE = 5;

export type ProductReviewItem = {
  id: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  authorName: string;
  avatarUrl?: string;
};

type ReviewAuthorRow = {
  display_name: string | null;
  image_url: string | null;
};

export type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  users: ReviewAuthorRow | ReviewAuthorRow[] | null;
};

export type ReviewsPage = {
  items: ProductReviewItem[];
};

const normalizeAuthor = (
  users: ReviewRow["users"],
): ReviewAuthorRow | null => {
  if (!users) return null;
  return Array.isArray(users) ? (users[0] ?? null) : users;
};

const mapAuthorName = (users: ReviewRow["users"]): string => {
  const user = normalizeAuthor(users);
  return user?.display_name?.trim() || "Anonymous";
};

const mapAvatarUrl = (users: ReviewRow["users"]): string | undefined => {
  const imageUrl = normalizeAuthor(users)?.image_url?.trim();
  return imageUrl || undefined;
};

export const mapReviewRow = (row: ReviewRow): ProductReviewItem => {
  return {
    id: row.id,
    userId: row.user_id,
    rating: Number(row.rating),
    content: row.content?.trim() || "",
    createdAt: row.created_at,
    authorName: mapAuthorName(row.users),
    avatarUrl: mapAvatarUrl(row.users),
  };
};
