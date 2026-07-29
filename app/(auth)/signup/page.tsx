"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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

type SignupFormState = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

type SignupFormErrors = Partial<
  Record<keyof SignupFormState | "form", string>
>;

const INITIAL_FORM: SignupFormState = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

const validateSignupForm = (form: SignupFormState): SignupFormErrors => {
  const errors: SignupFormErrors = {};

  if (!form.email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!form.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (form.password.length < 6) {
    errors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "비밀번호 확인을 입력해 주세요.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }

  if (!form.agreeToTerms) {
    errors.agreeToTerms = "약관에 동의해 주세요.";
  }

  return errors;
};

const SignupPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = <K extends keyof SignupFormState>(
    key: K,
    value: SignupFormState[K],
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

    const nextErrors = validateSignupForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("입력 내용을 확인해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            name: form.name.trim() || undefined,
            username: form.username.trim() || undefined,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("회원가입이 완료되었습니다. 로그인해 주세요.");
      router.push(AUTH_URLS.LOGIN);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 다시 시도해 주세요.";
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
              Sign up
            </h1>

            <p
              className="text-[var(--commerce-text-secondary)]"
              style={{
                fontFamily: "var(--commerce-body-md-regular-font-family)",
                fontSize: "var(--commerce-body-md-regular-font-size)",
                lineHeight: "26px",
              }}
            >
              Already have an account?{" "}
              <Link
                href={AUTH_URLS.LOGIN}
                className="underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: "var(--commerce-primary-main)" }}
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-8">
              <Input
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                disabled={isLoading}
                error={errors.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
              />

              <Input
                name="username"
                autoComplete="username"
                placeholder="Username"
                value={form.username}
                disabled={isLoading}
                error={errors.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
              />

              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={form.email}
                disabled={isLoading}
                error={errors.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
              />

              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                }
              />

              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Confirm password"
                value={form.confirmPassword}
                disabled={isLoading}
                error={errors.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                className="rounded-none border-0 border-b border-[var(--commerce-border-light)] px-0"
                rightIcon={
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "비밀번호 확인 숨기기"
                        : "비밀번호 확인 표시"
                    }
                    className={cn(
                      "inline-flex items-center justify-center rounded-sm p-0.5",
                      "focus-visible:outline-2 focus-visible:outline-offset-2",
                    )}
                    style={{ outlineColor: "var(--commerce-primary-main)" }}
                    disabled={isLoading}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                }
              />
            </div>

            <Checkbox
              name="agreeToTerms"
              checked={form.agreeToTerms}
              disabled={isLoading}
              error={errors.agreeToTerms}
              onChange={(event) =>
                updateField("agreeToTerms", event.target.checked)
              }
              label={
                <>
                  I agree with{" "}
                  <Link
                    href={COMMERCE_URLS.PRIVACY}
                    className="underline underline-offset-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={COMMERCE_URLS.TERMS}
                    className="underline underline-offset-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Terms of Use
                  </Link>
                </>
              }
            />

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
              Sign Up
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
