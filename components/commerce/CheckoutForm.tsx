"use client";

import { useRef, useState, type FormEvent } from "react";
import { HiOutlineCreditCard } from "react-icons/hi2";
import type {
  CheckoutLineItem,
  CheckoutPricing,
} from "@/app/(commerce)/checkout/checkout-data";
import { findOrCreateOrder } from "@/app/(commerce)/checkout/actions";
import { getPublicEnv } from "@/commons/config/env";
import { ACCOUNT_URLS } from "@/commons/constants/url";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import {
  isValidTossPhone,
  loadCheckoutOrderId,
  normalizePhoneForToss,
  saveCheckoutOrderId,
} from "@/commons/utils/order";
import { toast } from "@/commons/utils/toast";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import {
  TossPayment,
  type TossPaymentHandle,
} from "@/components/commerce/TossPayment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type CheckoutDefaultValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CheckoutFormProps = {
  lineItems: CheckoutLineItem[];
  pricing: CheckoutPricing;
  defaultValues: CheckoutDefaultValues;
  customerKey: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  country: string;
  city: string;
  state: string;
  zip: string;
};

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

type PaymentMethod = "toss";

const sectionTitleStyle = {
  color: commerceColors.text.secondary,
  fontFamily: commerceTypography.fontFamily.heading,
  fontSize: commerceTypography.headline.h7.fontSize,
  fontWeight: commerceTypography.fontWeight.medium,
  lineHeight: "28px",
} as const;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "이름을 입력해 주세요.";
  if (!form.lastName.trim()) errors.lastName = "성을 입력해 주세요.";
  if (!form.phone.trim()) {
    errors.phone = "전화번호를 입력해 주세요.";
  } else if (!isValidTossPhone(form.phone)) {
    errors.phone = "휴대폰 번호는 숫자 10~11자리로 입력해 주세요.";
  }
  if (!form.email.trim()) {
    errors.email = "이메일을 입력해 주세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }
  if (!form.addressLine1.trim()) {
    errors.addressLine1 = "도로명 주소를 입력해 주세요.";
  }
  if (!form.country.trim()) errors.country = "국가를 입력해 주세요.";
  if (!form.city.trim()) errors.city = "도시를 입력해 주세요.";
  if (!form.zip.trim()) errors.zip = "우편번호를 입력해 주세요.";

  return errors;
}

/**
 * 결제 폼 (Contact + Shipping + Payment) + 우측 OrderSummary
 * Place Order → findOrCreateOrder → 토스 결제창
 */
export const CheckoutForm = ({
  lineItems,
  pricing,
  defaultValues,
  customerKey,
}: CheckoutFormProps) => {
  const tossRef = useRef<TossPaymentHandle>(null);
  const { tossPayments, siteUrl } = getPublicEnv();

  const [form, setForm] = useState<FormState>({
    firstName: defaultValues.firstName,
    lastName: defaultValues.lastName,
    phone: defaultValues.phone,
    email: defaultValues.email,
    addressLine1: "",
    country: "Korea",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("toss");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
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
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("입력 내용을 확인해 주세요.");
      return;
    }

    if (!tossRef.current?.ready) {
      toast.error("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await findOrCreateOrder({
        contact: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
        },
        shipping: {
          addressLine1: form.addressLine1,
          country: form.country,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        expectedPricing: pricing,
        existingOrderId: loadCheckoutOrderId() ?? undefined,
      });

      if (!result.ok) {
        setErrors({ form: result.error });
        toast.error(result.error);
        return;
      }

      saveCheckoutOrderId(result.orderId);

      const origin =
        typeof window !== "undefined" ? window.location.origin : siteUrl;

      await tossRef.current.requestPayment({
        orderId: result.tossOrderId,
        orderName: result.orderName,
        amount: result.amount,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email.trim(),
        customerMobilePhone: normalizePhoneForToss(form.phone),
        successUrl: `${origin}${ACCOUNT_URLS.CHECKOUT_SUCCESS}?dbOrderId=${result.orderId}`,
        failUrl: `${origin}${ACCOUNT_URLS.CHECKOUT_FAIL}?dbOrderId=${result.orderId}`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "결제 요청 중 오류가 발생했습니다.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <TossPayment
        ref={tossRef}
        clientKey={tossPayments.clientKey}
        customerKey={customerKey}
      />

      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-1 flex-col gap-8"
        noValidate
      >
        {/* Contact Information */}
        <section
          className="flex flex-col gap-4 rounded-md border p-4 sm:p-6"
          style={{ borderColor: commerceColors.border.light }}
          aria-labelledby="checkout-contact-heading"
        >
          <h2 id="checkout-contact-heading" style={sectionTitleStyle}>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="firstName"
              label="FIRST NAME"
              placeholder="First name"
              autoComplete="given-name"
              value={form.firstName}
              error={errors.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
            />
            <Input
              name="lastName"
              label="LAST NAME"
              placeholder="Last name"
              autoComplete="family-name"
              value={form.lastName}
              error={errors.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
            />
          </div>
          <Input
            name="phone"
            label="PHONE NUMBER"
            placeholder="Phone number"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          <Input
            name="email"
            label="EMAIL ADDRESS"
            placeholder="Email address"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </section>

        {/* Shipping Address */}
        <section
          className="flex flex-col gap-4 rounded-md border p-4 sm:p-6"
          style={{ borderColor: commerceColors.border.light }}
          aria-labelledby="checkout-shipping-heading"
        >
          <h2 id="checkout-shipping-heading" style={sectionTitleStyle}>
            Shipping Address
          </h2>
          <Input
            name="addressLine1"
            label="STREET ADDRESS *"
            placeholder="Street Address"
            autoComplete="street-address"
            value={form.addressLine1}
            error={errors.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
          />
          <Input
            name="country"
            label="COUNTRY *"
            placeholder="Country"
            autoComplete="country-name"
            value={form.country}
            error={errors.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
          <Input
            name="city"
            label="TOWN / CITY *"
            placeholder="Town / City"
            autoComplete="address-level2"
            value={form.city}
            error={errors.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="state"
              label="STATE"
              placeholder="State"
              autoComplete="address-level1"
              value={form.state}
              error={errors.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
            <Input
              name="zip"
              label="ZIP CODE *"
              placeholder="Zip Code"
              autoComplete="postal-code"
              value={form.zip}
              error={errors.zip}
              onChange={(e) => updateField("zip", e.target.value)}
            />
          </div>
        </section>

        {/* Payment method — Figma 61:11478 */}
        <section
          className="flex flex-col gap-6 rounded border p-6"
          style={{ borderColor: commerceColors.border.dark }}
          aria-labelledby="checkout-payment-heading"
        >
          <h2 id="checkout-payment-heading" style={sectionTitleStyle}>
            Payment method
          </h2>

          <div role="radiogroup" aria-label="결제 수단" className="flex flex-col gap-3">
            <label
              className="flex h-[52px] cursor-pointer items-center justify-between rounded px-4"
              style={{
                backgroundColor: commerceColors.background.light,
                border:
                  paymentMethod === "toss"
                    ? `1px solid ${commerceColors.primary.main}`
                    : "1px solid transparent",
              }}
            >
              <span className="inline-flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="toss"
                  checked={paymentMethod === "toss"}
                  onChange={() => setPaymentMethod("toss")}
                  className="size-[18px]"
                  style={{ accentColor: commerceColors.primary.main }}
                />
                <span
                  style={{
                    color: commerceColors.text.secondary,
                    fontSize: commerceTypography.body.md.regular.fontSize,
                    lineHeight: "26px",
                  }}
                >
                  Pay by Toss Payments
                </span>
              </span>
              <HiOutlineCreditCard
                size={24}
                aria-hidden
                style={{ color: commerceColors.text.secondary }}
              />
            </label>
          </div>
        </section>

        {errors.form ? (
          <p
            role="alert"
            style={{
              color: commerceColors.semantic.error,
              fontSize: commerceTypography.caption.md.regular.fontSize,
            }}
          >
            {errors.form}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="solid"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Place Order
        </Button>
      </form>

      <div className="w-full shrink-0 lg:max-w-[413px]">
        <OrderSummary lineItems={lineItems} pricing={pricing} />
      </div>
    </div>
  );
};
