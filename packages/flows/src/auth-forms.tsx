"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Input,
  PortalButton,
} from "@kifiya/ui";
import {
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";

/**
 * Full-page frame for sign-in screens: an optional marketing panel (`aside`)
 * beside a centred form card, on the Kifiya page-shell background.
 */
export function AuthLayout({
  aside,
  className,
  children,
}: {
  aside?: ReactNode;
  /** Overrides the full-height page, e.g. to embed it in a preview. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <main
      className={cn(
        "k-shell relative flex min-h-screen items-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-[1280px] gap-8 lg:items-center",
          aside ? "lg:grid-cols-[1.08fr_0.92fr]" : "",
        )}
      >
        {aside ? <section className="hidden lg:block">{aside}</section> : null}
        <section
          className={cn(
            "flex items-center justify-center",
            aside ? "lg:justify-end" : "",
          )}
        >
          {children}
        </section>
      </div>
    </main>
  );
}

function FormCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-lg rounded-[32px] border border-(--border-soft) bg-(--surface-card) py-0 shadow-(--shadow-elevated)">
      <CardHeader className="space-y-0 px-8 pt-8 pb-0">
        <div className="flex size-14 items-center justify-center rounded-[20px] bg-(--brand-primary-soft) text-(--brand-primary) shadow-sm">
          <Icon className="size-6" aria-hidden />
        </div>
        <CardTitle className="pt-6 text-3xl font-semibold tracking-tight text-(--text-heading)">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="pt-1 text-sm text-(--text-muted)">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-8 pt-8 pb-8">{children}</CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-(--text-heading)">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-(--status-danger-strong)">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-11 rounded-xl border-(--border-soft) bg-(--surface-card) aria-invalid:border-(--status-danger)";

function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  invalid,
  inputRef,
  onChange,
  labels,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete: string;
  invalid: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange: () => void;
  labels: { show: string; hide: string };
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        ref={inputRef}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(inputClass, "pr-11")}
        onChange={onChange}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-md p-1 text-(--text-muted) outline-none transition-colors hover:text-(--text-heading) focus-visible:ring-2 focus-visible:ring-(--brand-primary) focus-visible:ring-offset-2"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? labels.hide : labels.show}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden />
        ) : (
          <Eye className="size-5" aria-hidden />
        )}
      </button>
    </div>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-(--status-danger-soft) px-4 py-3 text-sm text-(--status-danger-strong)"
    >
      {message}
    </p>
  );
}

/** Maps a failure to the message shown. The error's own text is never shown (D-012). */
export type AuthErrorMessage = (error: unknown) => string | undefined;

const signInDefaults = {
  title: "Welcome back",
  description: "Sign in to continue.",
  identifierLabel: "Email or phone number",
  identifierPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  submit: "Sign in",
  submitting: "Signing in…",
  identifierRequired: "Enter your email or phone number.",
  passwordRequired: "Enter your password.",
  failed: "Sign-in failed. Check your details and try again.",
  showPassword: "Show password",
  hidePassword: "Hide password",
};

export interface SignInValues {
  identifier: string;
  password: string;
}

export interface SignInFormProps {
  /** Called with the trimmed identifier and the password. Reject to show an error. */
  onSubmit: (values: SignInValues) => Promise<void>;
  /** Maps a rejection to the message shown; falls back to `labels.failed`. */
  errorMessage?: AuthErrorMessage;
  /** Shown above the form, e.g. "Your password is set. Sign in." */
  notice?: ReactNode;
  /** Shown below the submit button, e.g. "Forgot password?" links. */
  footer?: ReactNode;
  defaultIdentifier?: string;
  labels?: Partial<typeof signInDefaults>;
}

/**
 * Identifier + password sign-in card. Blank fields are reported under each
 * field and `onSubmit` is not called (AC-03.6); a failed submit shows the
 * app's message and keeps the identifier (AC-03.7).
 */
export function SignInForm({
  onSubmit,
  errorMessage,
  notice,
  footer,
  defaultIdentifier = "",
  labels: overrides,
}: SignInFormProps) {
  const labels = { ...signInDefaults, ...overrides };
  const id = useId();
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("identifier") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next = {
      identifier: identifier ? undefined : labels.identifierRequired,
      password: password ? undefined : labels.passwordRequired,
    };
    setErrors(next);
    setFormError(null);
    if (next.identifier || next.password) {
      (next.identifier ? identifierRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ identifier, password });
    } catch (error) {
      setFormError(errorMessage?.(error) ?? labels.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormCard
      icon={UserRound}
      title={labels.title}
      description={labels.description}
    >
      {notice ? (
        <div
          role="status"
          className="mb-5 rounded-xl bg-(--brand-primary-soft) px-4 py-3 text-sm text-(--text-heading)"
        >
          {notice}
        </div>
      ) : null}
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <Field
          id={`${id}-identifier`}
          label={labels.identifierLabel}
          error={errors.identifier}
        >
          <Input
            id={`${id}-identifier`}
            name="identifier"
            ref={identifierRef}
            defaultValue={defaultIdentifier}
            placeholder={labels.identifierPlaceholder}
            autoComplete="username"
            aria-invalid={errors.identifier ? true : undefined}
            aria-describedby={
              errors.identifier ? `${id}-identifier-error` : undefined
            }
            className={inputClass}
            onChange={() => setErrors((e) => ({ ...e, identifier: undefined }))}
          />
        </Field>
        <Field
          id={`${id}-password`}
          label={labels.passwordLabel}
          error={errors.password}
        >
          <PasswordInput
            id={`${id}-password`}
            name="password"
            inputRef={passwordRef}
            placeholder={labels.passwordPlaceholder}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            onChange={() => setErrors((e) => ({ ...e, password: undefined }))}
            labels={{ show: labels.showPassword, hide: labels.hidePassword }}
          />
        </Field>
        <FormError message={formError} />
        <PortalButton type="submit" className="w-full" loading={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </PortalButton>
        {footer ? <div className="text-center text-sm">{footer}</div> : null}
      </form>
    </FormCard>
  );
}

const changePasswordDefaults = {
  title: "Set a new password",
  description: "Choose a new password to continue.",
  newPasswordLabel: "New password",
  newPasswordPlaceholder: "Enter a new password",
  confirmLabel: "Confirm new password",
  confirmPlaceholder: "Re-enter the new password",
  submit: "Save password",
  submitting: "Saving…",
  required: "Enter a new password.",
  mismatch: "Passwords do not match.",
  failed: "The password could not be changed. Try again.",
  showPassword: "Show password",
  hidePassword: "Hide password",
};

export interface ChangePasswordFormProps {
  /**
   * The app's password rules: return the reason a password is refused, or
   * `null` to accept it (D-011). The kit adds no rule of its own beyond the
   * confirmation matching.
   */
  validatePassword: (password: string) => string | null;
  onSubmit: (newPassword: string) => Promise<void>;
  errorMessage?: AuthErrorMessage;
  footer?: ReactNode;
  labels?: Partial<typeof changePasswordDefaults>;
}

/**
 * New-password card, e.g. after signing in with a temporary password. A
 * password that fails the app's rules, or a confirmation that differs, is
 * refused with the reason shown (AC-03.8).
 */
export function ChangePasswordForm({
  validatePassword,
  onSubmit,
  errorMessage,
  footer,
  labels: overrides,
}: ChangePasswordFormProps) {
  const labels = { ...changePasswordDefaults, ...overrides };
  const id = useId();
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("new-password") ?? "");
    const confirm = String(data.get("confirm-password") ?? "");

    const passwordError = password
      ? validatePassword(password)
      : labels.required;
    const confirmError =
      !passwordError && password !== confirm ? labels.mismatch : undefined;
    setErrors({ password: passwordError ?? undefined, confirm: confirmError });
    setFormError(null);
    if (passwordError) {
      newRef.current?.focus();
      return;
    }
    if (confirmError) {
      confirmRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(password);
    } catch (error) {
      setFormError(errorMessage?.(error) ?? labels.failed);
    } finally {
      setSubmitting(false);
    }
  }

  const toggle = { show: labels.showPassword, hide: labels.hidePassword };

  return (
    <FormCard
      icon={KeyRound}
      title={labels.title}
      description={labels.description}
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <Field
          id={`${id}-new`}
          label={labels.newPasswordLabel}
          error={errors.password}
        >
          <PasswordInput
            id={`${id}-new`}
            name="new-password"
            inputRef={newRef}
            placeholder={labels.newPasswordPlaceholder}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            onChange={() => setErrors((e) => ({ ...e, password: undefined }))}
            labels={toggle}
          />
        </Field>
        <Field
          id={`${id}-confirm`}
          label={labels.confirmLabel}
          error={errors.confirm}
        >
          <PasswordInput
            id={`${id}-confirm`}
            name="confirm-password"
            inputRef={confirmRef}
            placeholder={labels.confirmPlaceholder}
            autoComplete="new-password"
            invalid={Boolean(errors.confirm)}
            onChange={() => setErrors((e) => ({ ...e, confirm: undefined }))}
            labels={toggle}
          />
        </Field>
        <FormError message={formError} />
        <PortalButton type="submit" className="w-full" loading={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </PortalButton>
        {footer ? <div className="text-center text-sm">{footer}</div> : null}
      </form>
    </FormCard>
  );
}
