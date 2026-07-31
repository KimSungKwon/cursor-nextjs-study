"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { useSessionStore } from "@/commons/store/session-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/browser";

export type AccountDetailsFormProps = {
  initialDisplayName: string | null;
  email: string;
};

type FormState = {
  displayName: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

const validateForm = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  const wantsPasswordChange =
    form.oldPassword.length > 0 ||
    form.newPassword.length > 0 ||
    form.confirmPassword.length > 0;

  if (!form.displayName.trim()) {
    errors.displayName = "표시 이름을 입력해 주세요.";
  }

  if (wantsPasswordChange) {
    if (!form.oldPassword) {
      errors.oldPassword = "현재 비밀번호를 입력해 주세요.";
    }
    if (!form.newPassword) {
      errors.newPassword = "새 비밀번호를 입력해 주세요.";
    } else if (form.newPassword.length < 6) {
      errors.newPassword = "비밀번호는 최소 6자 이상이어야 합니다.";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "새 비밀번호 확인을 입력해 주세요.";
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";
    }
  }

  return errors;
};

/**
 * 계정 상세 / 비밀번호 수정 폼 (피그마 Detail 65:4502)
 */
export const AccountDetailsForm = ({
  initialDisplayName,
  email,
}: AccountDetailsFormProps) => {
  const router = useRouter();
  const setUser = useSessionStore((state) => state.setUser);
  const currentUser = useSessionStore((state) => state.user);

  const [form, setForm] = useState<FormState>({
    displayName: initialDisplayName ?? "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key] && !prev.form) return prev;
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("입력 내용을 확인해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("로그인이 필요합니다.");
      }

      const displayName = form.displayName.trim();
      const wantsPasswordChange =
        form.oldPassword.length > 0 ||
        form.newPassword.length > 0 ||
        form.confirmPassword.length > 0;

      if (wantsPasswordChange) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email,
          password: form.oldPassword,
        });

        if (reauthError) {
          throw new Error("현재 비밀번호가 올바르지 않습니다.");
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: form.newPassword,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      const { error: profileError } = await supabase
        .from("users")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        } as never) // TODO: types/supabase.ts 생성 후 as never 제거
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          name: displayName,
        },
      });

      if (currentUser) {
        setUser({
          ...currentUser,
          displayName,
        });
      }

      setForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("계정 정보가 저장되었습니다.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "계정 정보 저장에 실패했습니다.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const sectionTitleStyle = {
    fontFamily: commerceTypography.fontFamily.body,
    fontSize: commerceTypography.body.lg.semibold.fontSize,
    fontWeight: commerceTypography.fontWeight.semibold,
    lineHeight: "32px",
    color: commerceColors.text.primary,
  } as const;

  const PasswordToggle = ({
    visible,
    onToggle,
    label,
  }: {
    visible: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="text-[var(--commerce-text-tertiary)] transition-colors hover:text-[var(--commerce-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: commerceColors.primary.main }}
    >
      {visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
    </button>
  );

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="flex w-full max-w-[707px] flex-col gap-10"
      noValidate
    >
      <Toaster position="top-center" />

      <section className="flex flex-col gap-6" aria-labelledby="account-details-heading">
        <h2 id="account-details-heading" style={sectionTitleStyle}>
          Account Details
        </h2>

        <div className="flex flex-col gap-2">
          <Input
            id="displayName"
            name="displayName"
            label="Display name"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Display name"
            error={errors.displayName}
            autoComplete="nickname"
          />
          <p
            style={{
              fontFamily: commerceTypography.fontFamily.body,
              fontSize: commerceTypography.caption.sm.regular.fontSize,
              fontStyle: "italic",
              lineHeight: "20px",
              color: commerceColors.text.tertiary,
            }}
          >
            This will be how your name will be displayed in the account section
            and in reviews
          </p>
        </div>

        <Input
          id="email"
          name="email"
          label="Email *"
          type="email"
          value={email}
          readOnly
          disabled
          autoComplete="email"
        />
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="password-heading">
        <h2 id="password-heading" style={sectionTitleStyle}>
          Password
        </h2>

        <Input
          id="oldPassword"
          name="oldPassword"
          label="Old password"
          type={showOldPassword ? "text" : "password"}
          value={form.oldPassword}
          onChange={(event) => updateField("oldPassword", event.target.value)}
          placeholder="Old password"
          error={errors.oldPassword}
          autoComplete="current-password"
          rightIcon={
            <PasswordToggle
              visible={showOldPassword}
              onToggle={() => setShowOldPassword((prev) => !prev)}
              label={showOldPassword ? "현재 비밀번호 숨기기" : "현재 비밀번호 보기"}
            />
          }
        />

        <Input
          id="newPassword"
          name="newPassword"
          label="New password"
          type={showNewPassword ? "text" : "password"}
          value={form.newPassword}
          onChange={(event) => updateField("newPassword", event.target.value)}
          placeholder="New password"
          error={errors.newPassword}
          autoComplete="new-password"
          rightIcon={
            <PasswordToggle
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
              label={showNewPassword ? "새 비밀번호 숨기기" : "새 비밀번호 보기"}
            />
          }
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Repeat new password"
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(event) =>
            updateField("confirmPassword", event.target.value)
          }
          placeholder="Repeat new password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          rightIcon={
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              label={
                showConfirmPassword
                  ? "비밀번호 확인 숨기기"
                  : "비밀번호 확인 보기"
              }
            />
          }
        />

        {errors.form ? (
          <p
            role="alert"
            style={{
              fontSize: commerceTypography.caption.sm.regular.fontSize,
              color: commerceColors.semantic.error,
            }}
          >
            {errors.form}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="solid"
          size="lg"
          loading={isLoading}
          className="w-fit min-w-[183px]"
        >
          Save changes
        </Button>
      </section>
    </form>
  );
};
