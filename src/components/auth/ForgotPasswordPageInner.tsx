"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { AuthService } from "@/src/services/auth.service";
import { validateForgotPasswordForm } from "@/src/lib/auth-validation";
import { ROUTES } from "@/src/lib/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForgotPasswordPageInnerProps {
  showBrand?: boolean;
}

type Step = "form" | "sent";

// ─── Component ────────────────────────────────────────────────────────────────

export function ForgotPasswordPageInner({ showBrand = true }: ForgotPasswordPageInnerProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleEmailChange(val: string) {
    setEmail(val);
    if (emailError) setEmailError(null);
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateForgotPasswordForm({ email });
    if (fieldErrors.email) {
      setEmailError(fieldErrors.email);
      return;
    }

    setIsLoading(true);
    setServerError(null);
    try {
      await AuthService.forgotPassword(email.trim().toLowerCase());
      setStep("sent");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Không thể gửi email. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email.trim().toLowerCase());
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render: sent ─────────────────────────────────────────────────────────────

  if (step === "sent") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-5 flex justify-center">
          <CheckCircleIcon className="size-16 text-success-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">Kiểm tra email của bạn</h1>
        <p className="mt-3 text-sm text-secondary-600 leading-relaxed">
          Chúng tôi đã gửi link đặt lại mật khẩu tới{" "}
          <span className="font-semibold text-secondary-800">{email}</span>. Vui lòng
          kiểm tra hộp thư và làm theo hướng dẫn.
        </p>
        <p className="mt-2 text-xs text-secondary-400">
          Không thấy email? Kiểm tra thư mục Spam hoặc{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-primary-600 hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            {isLoading ? "Đang gửi…" : "gửi lại"}
          </button>
          .
        </p>
        <Link
          href={ROUTES.login}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  // ── Render: form ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md">
      {showBrand && (
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-secondary-900">Quên mật khẩu?</h1>
          <p className="mt-1.5 text-sm text-secondary-500 leading-relaxed">
            Nhập email đăng ký của bạn. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
          </p>
        </div>
      )}

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          errorMessage={emailError ?? undefined}
          prefixIcon={<EnvelopeIcon />}
          disabled={isLoading}
          fullWidth
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-2"
        >
          Gửi link đặt lại mật khẩu
        </Button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
