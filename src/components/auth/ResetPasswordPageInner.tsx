"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { Spinner } from "@/src/components/ui/Spinner";
import { PasswordInput } from "../ui/PasswordInput";
import { AuthService } from "@/src/services/auth.service";
import { validateResetPasswordForm } from "@/src/lib/auth-validation";
import { ROUTES } from "@/src/lib/routes";
import type { ResetPasswordFormValues } from "@/src/types/auth.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TokenStatus = "validating" | "valid" | "invalid";
type SubmitStatus = "idle" | "loading" | "success";

// ─── Component ────────────────────────────────────────────────────────────────

export function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [values, setValues] = useState<ResetPasswordFormValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFormValues, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    AuthService.validateResetToken(token)
      .then((valid) => setTokenStatus(valid ? "valid" : "invalid"))
      .catch(() => setTokenStatus("invalid"));
  }, [token]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function setField<K extends keyof ResetPasswordFormValues>(key: K, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateResetPasswordForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitStatus("loading");
    setServerError(null);
    try {
      await AuthService.resetPassword(token, values.password);
      setSubmitStatus("success");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại. Vui lòng thử lại."
      );
      setSubmitStatus("idle");
    }
  }

  // ── Render: validating token ──────────────────────────────────────────────

  if (tokenStatus === "validating") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-4 py-8">
        <Spinner size="lg" />
        <p className="text-sm text-secondary-500">Đang xác thực link đặt lại mật khẩu…</p>
      </div>
    );
  }

  // ── Render: invalid token ─────────────────────────────────────────────────

  if (tokenStatus === "invalid") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-5 flex justify-center">
          <ExclamationTriangleIcon className="size-16 text-warning-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">Link không hợp lệ</h1>
        <p className="mt-3 text-sm text-secondary-500 leading-relaxed">
          Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Link chỉ có hiệu lực trong{" "}
          <strong>30 phút</strong> kể từ khi được gửi.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push(ROUTES.forgotPassword)}
        >
          Yêu cầu link mới
        </Button>
      </div>
    );
  }

  // ── Render: success ───────────────────────────────────────────────────────

  if (submitStatus === "success") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-5 flex justify-center">
          <CheckCircleIcon className="size-16 text-success-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">Đặt lại mật khẩu thành công</h1>
        <p className="mt-3 text-sm text-secondary-500">
          Mật khẩu mới của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.
        </p>
        <Button
          className="mt-6"
          fullWidth
          onClick={() => router.push(ROUTES.login)}
        >
          Đến trang đăng nhập
        </Button>
      </div>
    );
  }

  // ── Render: form ──────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-secondary-900">Đặt lại mật khẩu</h1>
        <p className="mt-1.5 text-sm text-secondary-500">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Mật khẩu mới"
          placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setField("password", e.target.value)}
          errorMessage={errors.password}
          helperText={!errors.password ? "Ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số" : undefined}
          disabled={submitStatus === "loading"}
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
          errorMessage={errors.confirmPassword}
          disabled={submitStatus === "loading"}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={submitStatus === "loading"}
          className="mt-2"
        >
          Xác nhận đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
}
