"use client";

import { AlertCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { cn } from "../lib/cn";
import { Banner } from "./banner";
import { PortalButton, type PortalButtonProps } from "./portal-button";

/** Focuses a field's control: the element itself, or the first focusable inside it (a group). */
function focusField(element: HTMLElement | null | undefined) {
  if (!element) return;
  const target = element.matches("input, textarea, select, button, [tabindex]")
    ? element
    : element.querySelector<HTMLElement>(
        "input, textarea, select, button, [tabindex]",
      );
  (target ?? element).focus();
}

const FALLBACK_SUBMIT_ERROR = "Something went wrong. Please try again.";

/** A validator per field: return the message to show, or nothing when valid. */
export type FormValidators<V> = {
  [K in keyof V]?: (value: V[K], values: V) => string | undefined | null;
};

export type FormErrors<V> = Partial<Record<keyof V, string>>;

export type UseFormOptions<V> = {
  initialValues: V;
  validate?: FormValidators<V>;
  /** Runs with valid values. Throw (or reject) to report a failure. */
  onSubmit: (values: V) => void | Promise<void>;
  /**
   * The message shown when `onSubmit` fails. The error's own text is never
   * shown, since it may carry internal detail; without a mapper, or when it
   * returns nothing, a generic message is shown.
   */
  submitErrorMessage?: (error: unknown) => string | undefined | null;
};

export type FormState<V> = {
  values: V;
  errors: FormErrors<V>;
  submitting: boolean;
  /** The message for the last failed submit, or `null`. */
  submitError: string | null;
  /** Sets one field and clears its error. */
  setValue: <K extends keyof V>(name: K, value: V[K]) => void;
  setValues: (values: V) => void;
  /** Validates every field; submits when they all pass. */
  handleSubmit: (event?: FormEvent) => Promise<void>;
  /** Back to the initial values (or `values`), with no errors. */
  reset: (values?: V) => void;
  /** Bumped on every failed validation; `Form` focuses the first invalid field. @internal */
  invalidSubmits: number;
};

/**
 * Holds a form's values, field errors and submitting state. Pass the result
 * to `<Form form={…}>`; fields read it through `FormField`.
 */
export function useForm<V extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  submitErrorMessage,
}: UseFormOptions<V>): FormState<V> {
  const [values, setValuesState] = useState<V>(initialValues);
  const [errors, setErrors] = useState<FormErrors<V>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [invalidSubmits, setInvalidSubmits] = useState(0);
  const submittingRef = useRef(false);

  const latest = useRef({ values, validate, onSubmit, submitErrorMessage });
  latest.current = { values, validate, onSubmit, submitErrorMessage };

  const setValue = useCallback(<K extends keyof V>(name: K, value: V[K]) => {
    setValuesState((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (event?: FormEvent) => {
    event?.preventDefault();
    if (submittingRef.current) return;
    const { values, validate, onSubmit, submitErrorMessage } = latest.current;

    const found: FormErrors<V> = {};
    for (const name of Object.keys(validate ?? {}) as (keyof V)[]) {
      const message = validate?.[name]?.(values[name], values);
      if (message) found[name] = message;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setInvalidSubmits((n) => n + 1);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(submitErrorMessage?.(error) || FALLBACK_SUBMIT_ERROR);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, []);

  const reset = useCallback(
    (next?: V) => {
      setValuesState(next ?? initialValues);
      setErrors({});
      setSubmitError(null);
    },
    [initialValues],
  );

  return {
    values,
    errors,
    submitting,
    submitError,
    setValue,
    setValues: setValuesState,
    handleSubmit,
    reset,
    invalidSubmits,
  };
}

type FormContextValue = {
  // Fields are keyed by name at runtime; the value types live in the app.
  form: FormState<Record<string, unknown>>;
  idPrefix: string;
};

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext(component: string): FormContextValue {
  const context = useContext(FormContext);
  if (!context) throw new Error(`${component} must be rendered inside <Form>.`);
  return context;
}

export type FormProps<V> = {
  form: FormState<V>;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  /**
   * From this many invalid fields up, a submit shows a summary above the
   * form listing each problem (linked to its field) and focuses it; with
   * fewer, the first invalid field is focused. Default 3.
   */
  errorSummaryThreshold?: number;
  /** The summary's title; gets the number of problems. */
  errorSummaryTitle?: (count: number) => string;
};

type SummaryItem = { name: string; id: string; label: string };

/**
 * A form bound to `useForm`. On an invalid submit it focuses the first
 * invalid field, or, with three or more, shows and focuses a summary linking
 * to each; while submitting its fields and buttons are disabled; a
 * failed submit shows its message above the fields, keeping what was typed.
 */
export function Form<V extends Record<string, unknown>>({
  form,
  children,
  className,
  "aria-label": ariaLabel,
  errorSummaryThreshold = 3,
  errorSummaryTitle = (count) => `${count} fields need attention`,
}: FormProps<V>) {
  const idPrefix = useId();
  const ref = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summary, setSummary] = useState<SummaryItem[] | null>(null);
  const errors = form.errors as Record<string, string | undefined>;

  useEffect(() => {
    if (form.invalidSubmits === 0) return;
    const root = ref.current;
    if (!root) return;
    // Invalid fields in the order they appear on the page.
    const items = Object.keys(errors)
      .filter((name) => errors[name])
      .map((name) => {
        const id = `${idPrefix}-${name}`;
        const element = root.ownerDocument.getElementById(id);
        const label = root.querySelector(`label[for="${CSS.escape(id)}"]`);
        return {
          name,
          id,
          element,
          label: label?.firstChild?.textContent?.trim() || name,
        };
      })
      .sort((a, b) =>
        a.element && b.element
          ? a.element.compareDocumentPosition(b.element) &
            Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1
          : 0,
      );
    if (items.length >= errorSummaryThreshold) {
      setSummary(items.map(({ name, id, label }) => ({ name, id, label })));
      return;
    }
    setSummary(null);
    const first =
      items[0]?.element ??
      root.querySelector<HTMLElement>('[aria-invalid="true"]');
    first?.scrollIntoView?.({ block: "center" });
    focusField(first);
    // Runs once per failed submit; `errors` is read as it was then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.invalidSubmits]);

  useEffect(() => {
    if (!summary) return;
    summaryRef.current?.scrollIntoView?.({ block: "center" });
    summaryRef.current?.focus();
  }, [summary]);

  const open = summary?.filter((item) => errors[item.name]) ?? [];

  return (
    <FormContext.Provider
      value={{
        form: form as unknown as FormState<Record<string, unknown>>,
        idPrefix,
      }}
    >
      <form
        ref={ref}
        noValidate
        aria-label={ariaLabel}
        aria-busy={form.submitting || undefined}
        onSubmit={form.handleSubmit}
        className={className}
      >
        <fieldset
          disabled={form.submitting}
          className="m-0 grid min-w-0 gap-4 border-0 p-0"
        >
          {open.length ? (
            <Banner
              ref={summaryRef}
              tone="danger"
              title={errorSummaryTitle(open.length)}
            >
              <ul className="list-disc space-y-1 pl-5">
                {open.map((item) => (
                  <li key={item.name}>
                    <a
                      href={`#${item.id}`}
                      className="underline underline-offset-2"
                      onClick={(event) => {
                        event.preventDefault();
                        focusField(
                          ref.current?.ownerDocument.getElementById(item.id),
                        );
                      }}
                    >
                      {item.label}: {errors[item.name]}
                    </a>
                  </li>
                ))}
              </ul>
            </Banner>
          ) : null}
          {form.submitError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-(--radius-control) border border-(--status-danger) bg-(--status-danger-soft) px-4 py-3 text-sm text-(--status-danger-strong)"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {form.submitError}
            </div>
          ) : null}
          {children}
        </fieldset>
      </form>
    </FormContext.Provider>
  );
}

/** Props to spread on the field's control so its label, hint and error are announced. */
export type FormFieldControlProps = {
  id: string;
  name: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

export type FormFieldRenderProps = FormFieldControlProps & {
  value: unknown;
  setValue: (value: unknown) => void;
  error: string | undefined;
  /** Everything a text `Input` or `Textarea` needs, value and change handler included. */
  inputProps: FormFieldControlProps & {
    value: string;
    onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
  };
};

export type FormFieldProps = {
  name: string;
  label: ReactNode;
  /** A hint under the control. */
  description?: ReactNode;
  /** Shows "(optional)" after the label. */
  optional?: boolean;
  optionalLabel?: string;
  className?: string;
  /** Renders the control: `{(field) => <Input {...field.inputProps} />}`. */
  children: (field: FormFieldRenderProps) => ReactNode;
};

/** A labelled field of the surrounding `Form`, with its error under the control. */
export function FormField({
  name,
  label,
  description,
  optional,
  optionalLabel = "(optional)",
  className,
  children,
}: FormFieldProps) {
  const { form, idPrefix } = useFormContext("FormField");
  const id = `${idPrefix}-${name}`;
  const error = form.errors[name];
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const value = form.values[name];

  const control: FormFieldControlProps = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div data-slot="form-field" className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-(--text-strong)">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-(--text-muted)">
            {optionalLabel}
          </span>
        ) : null}
      </label>
      {children({
        ...control,
        value,
        error,
        setValue: (next) => form.setValue(name, next),
        inputProps: {
          ...control,
          value: value == null ? "" : String(value),
          onChange: (event) => form.setValue(name, event.target.value),
        },
      })}
      {description ? (
        <p id={descriptionId} className="text-xs text-(--text-muted)">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-(--status-danger-strong)">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type FormSubmitProps = Omit<PortalButtonProps, "type" | "href">;

/** The form's submit button; it shows a spinner and is disabled while submitting. */
export function FormSubmit({ disabled, ...props }: FormSubmitProps) {
  const { form } = useFormContext("FormSubmit");
  return (
    <PortalButton
      type="submit"
      loading={form.submitting}
      disabled={disabled || form.submitting}
      {...props}
    />
  );
}
