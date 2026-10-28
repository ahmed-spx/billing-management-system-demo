import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn'

const controlBase =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text ' +
  'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-soft ' +
  'focus:border-primary disabled:cursor-not-allowed disabled:opacity-60'

interface LabelWrapProps {
  label: string
  /** Mono for numeric fields so columns align. */
  mono?: boolean
  children: ReactNode
  className?: string
}

/** Uppercase micro-label above a control. */
export function Field({ label, children, className }: LabelWrapProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  mono?: boolean
  wrapClassName?: string
}

export function TextField({
  label,
  mono,
  wrapClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} className={wrapClassName}>
      <input
        className={cn(controlBase, mono && 'font-mono tabular-nums', className)}
        {...props}
      />
    </Field>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  wrapClassName?: string
  children: ReactNode
}

export function SelectField({
  label,
  wrapClassName,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <Field label={label} className={wrapClassName}>
      <select className={cn(controlBase, className)} {...props}>
        {children}
      </select>
    </Field>
  )
}

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  wrapClassName?: string
}

export function TextAreaField({
  label,
  wrapClassName,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field label={label} className={wrapClassName}>
      <textarea className={cn(controlBase, 'min-h-20', className)} {...props} />
    </Field>
  )
}
