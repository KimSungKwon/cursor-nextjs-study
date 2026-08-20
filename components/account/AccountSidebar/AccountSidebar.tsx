"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { HiOutlineCamera } from "react-icons/hi2";
import { updateProfileImage } from "@/app/(commerce)/account/actions";
import { commerceColors } from "@/commons/constants/color";
import { QUERY_KEYS } from "@/commons/constants/query-keys";
import { commerceTypography } from "@/commons/constants/typography";
import {
  ACCOUNT_URLS,
  ADMIN_URLS,
  AUTH_URLS,
} from "@/commons/constants/url";
import { useAuth } from "@/commons/hooks/useAuth";
import { toast } from "@/commons/utils/toast";
import { cn } from "@/commons/utils/cn";

export type AccountSidebarProps = {
  displayName: string | null;
  email: string;
  imageUrl?: string | null;
  isAdmin?: boolean;
};

type NavItem = {
  label: string;
  href?: string;
  action?: "logout";
};

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Account", href: ACCOUNT_URLS.ACCOUNT },
  { label: "Orders", href: ACCOUNT_URLS.ORDERS },
  { label: "Reviews", href: ACCOUNT_URLS.REVIEWS },
  { label: "Wishlist", href: ACCOUNT_URLS.WISHLIST },
];

const LOGOUT_ITEM: NavItem = { label: "Log Out", action: "logout" };

const MAX_FILE_BYTES = 1024 * 1024; // 1MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("이미지를 읽지 못했습니다."));
    };
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

/**
 * 마이페이지 좌측 메뉴 (피그마 MENU 65:4450)
 * 아바타 클릭 시 프로필 이미지를 data URL로 업로드·저장
 */
export const AccountSidebar = ({
  displayName,
  email,
  imageUrl = null,
  isAdmin = false,
}: AccountSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl);

  useEffect(() => {
    setPreviewUrl(imageUrl);
  }, [imageUrl]);

  const navItems: NavItem[] = [
    ...BASE_NAV_ITEMS,
    ...(isAdmin
      ? [{ label: "Dashboard", href: ADMIN_URLS.DASHBOARD } satisfies NavItem]
      : []),
    LOGOUT_ITEM,
  ];

  const resolvedName = displayName?.trim() || email.split("@")[0] || "User";
  const initial = resolvedName.charAt(0).toUpperCase();
  const avatarSrc = previewUrl?.trim() || null;

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push(AUTH_URLS.LOGIN);
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const openFilePicker = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      toast.error("이미지 용량은 1MB 이하로 선택해 주세요.");
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await updateProfileImage(dataUrl);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setPreviewUrl(result.imageUrl);
      toast.success("프로필 이미지가 저장되었습니다.");
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.all,
      });
      router.refresh();
    } catch {
      toast.error("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <aside
      className="flex w-full shrink-0 flex-col items-center rounded-lg px-4 pb-10 pt-10 sm:w-[262px]"
      style={{ backgroundColor: commerceColors.background.light }}
      aria-label="계정 메뉴"
    >
      <div className="mb-10 flex flex-col items-center gap-1.5">
        <div className="relative size-[80px]">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="relative flex size-full items-center justify-center overflow-hidden rounded-full transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60"
            style={{
              backgroundColor: commerceColors.primary.main,
              outlineColor: commerceColors.primary.main,
            }}
            aria-label="프로필 이미지 변경"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL 프로필
              <img
                src={avatarSrc}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span
                className="text-2xl font-semibold text-[var(--commerce-text-inverse)]"
                style={{ fontFamily: commerceTypography.fontFamily.body }}
                aria-hidden
              >
                {initial}
              </span>
            )}
            {isUploading ? (
              <span
                className="absolute inset-0 flex items-center justify-center bg-black/40"
                aria-hidden
              >
                <span className="size-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploading}
            className="absolute bottom-0 right-0 flex size-[30px] items-center justify-center rounded-full border-2 border-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none"
            style={{
              backgroundColor: commerceColors.primary.main,
              color: commerceColors.text.inverse,
              outlineColor: commerceColors.primary.main,
            }}
            aria-label="프로필 이미지 선택"
          >
            <HiOutlineCamera size={16} aria-hidden />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void handleFileChange(event);
            }}
            tabIndex={-1}
          />
        </div>

        <p
          className="max-w-[200px] truncate text-center"
          style={{
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.lg.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "32px",
            color: commerceColors.text.primary,
          }}
          title={resolvedName}
        >
          {resolvedName}
        </p>
        <p className="sr-only">{email}</p>
      </div>

      <nav className="flex w-full max-w-[230px] flex-col gap-3" aria-label="계정 내비게이션">
        {navItems.map((item) => {
          const isActive =
            item.href !== undefined &&
            (pathname === item.href ||
              (item.href !== ACCOUNT_URLS.ACCOUNT &&
                pathname.startsWith(item.href)));

          const itemClassName = cn(
            "flex h-[42px] w-full items-center border-b text-left transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
          );

          const itemStyle = {
            fontFamily: commerceTypography.fontFamily.body,
            fontSize: commerceTypography.body.md.semibold.fontSize,
            fontWeight: commerceTypography.fontWeight.semibold,
            lineHeight: "26px",
            color: isActive
              ? commerceColors.text.secondary
              : commerceColors.text.tertiary,
            borderColor: isActive
              ? commerceColors.primary.main
              : "transparent",
            outlineColor: commerceColors.primary.main,
          } as const;

          if (item.action === "logout") {
            return (
              <button
                key={item.label}
                type="button"
                className={itemClassName}
                style={itemStyle}
                disabled={isSigningOut}
                onClick={() => {
                  void handleLogout();
                }}
              >
                {isSigningOut ? "Logging out..." : item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={itemClassName}
              style={itemStyle}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
