import {
  AdminHeader,
  type AdminHeaderProps,
} from "@/components/admin/AdminHeader/AdminHeader";

export type AdminPageHeaderProps = Pick<
  AdminHeaderProps,
  "title" | "description" | "className"
>;

export const AdminPageHeader = ({
  title,
  description,
  className,
}: AdminPageHeaderProps) => {
  return (
    <AdminHeader
      title={title}
      description={description}
      className={className}
    />
  );
};
