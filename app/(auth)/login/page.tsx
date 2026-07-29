"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AUTH_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import { cn } from "@/commons/utils/cn";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/browser";
import { AuthBrandPanel } from "../_components/AuthBrandPanel";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBERED_EMAIL_KEY = "commerce_login_email";

type LoginFormState = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type LoginFormErrors = Partial<Record<keyof LoginFormState | "form", string>>;

const INITIAL_FORM: LoginFormState = {
  email: "",
  password: "",
  rememberMe: false,
};

const validateLoginForm = (form: LoginFormState): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!form.email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!form.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  }

  return errors;
};

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (!rememberedEmail) return;

    setForm((prev) => ({
      ...prev,
      email: rememberedEmail,
      rememberMe: true,
    }));
  }, []);

  const updateField = <K extends keyof LoginFormState>(
    key: K,
    value: LoginFormState[K],
  ) => {
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

    const nextErrors = validateLoginForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("입력 내용을 확인해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        throw error;
      }

      if (form.rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, form.email.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      toast.success("로그인되었습니다.");
      router.push(COMMERCE_URLS.HOME);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 다시 시도해 주세요.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[var(--commerce-background-default)] lg:grid-cols-[minmax(0,1.2fr)_minmax(24rem,1fr)]">
      <Toaster position="top-center" />

      <AuthBrandPanel />

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[456px]">
          <div className="mb-8 flex flex-col gap-6">
            <Link
              href={COMMERCE_URLS.HOME}
              className="inline-block text-[var(--commerce-text-primary)] lg:hidden"
              style={{
                fontFamily: "var(--commerce-navigation-logo-font-family)",
                fontSize: "var(--commerce-navigation-logo-font-size)",
                fontWeight: "var(--commerce-navigation-logo-font-weight)",
                lineHeight: "var(--commerce-navigation-logo-line-height)",
              }}
            >
              Cursor Commerce
            </Link>

            <h1
              className="text-[var(--commerce-text-secondary)]"
              style={{
                fontFamily: "var(--commerce-headline-h4-font-family)",
                fontSize: "var(--commerce-headline-h4-font-size)",
                fontWeight: "var(--commerce-headline-h4-font-weight)",
                lineHeight: "44px",
                letterSpacing: "-0.4px",
              }}
            >
              Sign In
            </h1>

            <p
              className="text-[var(--commerce-text-secondary)]"
              style={{
                fontFamily: "var(--commerce-body-md-regular-font-family)",
                fontSize: "var(--commerce-body-md-regular-font-size)",
                lineHeight: "26px",
              }}
            >
              Don&apos;t have an account yet?{" "}
              <Link
                href={AUTH_URLS.SIGNUP}
                className="underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: "var(--commerce-primary-main)" }}
              >
                Sign Up
              </Link>
            </p>
          </div>

          <form
            className="flex flex-col gap-8"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-8">
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Your username or email address"
                value={form.email}
                disabled={isLoading}
                error={errors.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
              />

              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                value={form.password}
                disabled={isLoading}
                error={errors.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
                rightIcon={
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
                    }
                    className={cn(
                      "inline-flex items-center justify-center rounded-sm p-0.5",
                      "focus-visible:outline-2 focus-visible:outline-offset-2",
                    )}
                    style={{ outlineColor: "var(--commerce-primary-main)" }}
                    disabled={isLoading}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Checkbox
                name="rememberMe"
                checked={form.rememberMe}
                disabled={isLoading}
                onChange={(event) =>
                  updateField("rememberMe", event.target.checked)
                }
                label="Remember me"
                className="w-auto"
              />

              <button
                type="button"
                className="shrink-0 text-[var(--commerce-text-secondary)] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  fontFamily: "var(--commerce-body-md-semibold-font-family)",
                  fontSize: "var(--commerce-body-md-semibold-font-size)",
                  fontWeight: "var(--commerce-body-md-semibold-font-weight)",
                  lineHeight: "26px",
                  outlineColor: "var(--commerce-primary-main)",
                }}
                onClick={() => toast("비밀번호 재설정은 준비 중입니다.")}
              >
                Forgot password?
              </button>
            </div>

            {errors.form ? (
              <p
                role="alert"
                className="text-[var(--commerce-semantic-error)]"
                style={{
                  fontFamily: "var(--commerce-caption-sm-regular-font-family)",
                  fontSize: "var(--commerce-caption-sm-regular-font-size)",
                }}
              >
                {errors.form}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="solid"
              size="md"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
