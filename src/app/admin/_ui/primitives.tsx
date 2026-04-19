"use client";

/**
 * Admin primitive components.
 * Token-driven via `.admin-theme` CSS variables in globals.css.
 * Use these across every page under /admin/*.
 */

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { Loader2 } from "lucide-react";

function cx(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const BTN_BASE = "inline-flex items-center justify-center gap-2 font-medium leading-none whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none";

const BTN_SIZE: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[12.5px] rounded-[6px]",
  md: "h-9 px-4 text-[13px] rounded-[8px]",
  lg: "h-11 px-5 text-[14px] rounded-[10px]",
};

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary:
    "bg-[var(--ad-accent)] text-black hover:bg-[var(--ad-accent-hover)]",
  secondary:
    "bg-[var(--ad-surface-2)] text-[var(--ad-fg)] border border-[var(--ad-border)] hover:bg-[var(--ad-surface-hover)] hover:border-[var(--ad-border-strong)]",
  ghost:
    "text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)] hover:bg-[var(--ad-surface-2)]",
  danger:
    "bg-[var(--ad-danger-bg)] text-[var(--ad-danger)] border border-[color:rgba(239,68,68,0.25)] hover:bg-[color:rgba(239,68,68,0.2)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, iconRight, children, className, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(BTN_BASE, BTN_SIZE[size], BTN_VARIANT[variant], className)}
      {...rest}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────
// IconButton (square, for icon-only actions)
// ─────────────────────────────────────────────────────────────────
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: BtnSize;
  variant?: "ghost" | "secondary";
  label: string; // for aria-label
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = "md", variant = "ghost", label, children, className, ...rest },
  ref
) {
  const sz = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const v =
    variant === "secondary"
      ? "bg-[var(--ad-surface-2)] border border-[var(--ad-border)] hover:bg-[var(--ad-surface-hover)] hover:border-[var(--ad-border-strong)] text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)]"
      : "text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)] hover:bg-[var(--ad-surface-2)]";
  return (
    <button
      ref={ref}
      aria-label={label}
      className={cx("inline-flex items-center justify-center rounded-[8px] transition-colors", sz, v, className)}
      {...rest}
    >
      {children}
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ padded = true, interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "bg-[var(--ad-surface)] border border-[var(--ad-border)] rounded-[14px] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_2px_8px_rgba(0,0,0,0.25)]",
        padded && "p-6",
        interactive && "transition-colors hover:border-[var(--ad-border-strong)] cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────
const FIELD_BASE =
  "w-full h-9 px-3 text-[13px] rounded-[8px] bg-[var(--ad-surface-2)] border border-[var(--ad-border)] text-[var(--ad-fg)] placeholder:text-[var(--ad-fg-faint)] transition-colors hover:border-[var(--ad-border-strong)] focus:border-[var(--ad-accent)] focus:outline-none";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref
) {
  return <input ref={ref} className={cx(FIELD_BASE, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 3, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx(FIELD_BASE, "h-auto py-2 leading-relaxed resize-y min-h-20", className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref
) {
  return (
    <select ref={ref} className={cx(FIELD_BASE, "appearance-none pr-8 bg-no-repeat bg-[right_10px_center] cursor-pointer", className)}
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.5)\' stroke-width=\'2.5\' stroke-linecap=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

export function Label({ children, htmlFor, required }: { children: ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11.5px] font-medium uppercase tracking-wide text-[var(--ad-fg-subtle)] mb-1.5">
      {children}
      {required && <span className="text-[var(--ad-accent)] ml-0.5">*</span>}
    </label>
  );
}

export function Field({ label, required, hint, children, htmlFor }: { label: string; required?: boolean; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] text-[var(--ad-fg-subtle)]">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────
export type BadgeTone = "neutral" | "gold" | "success" | "warning" | "danger" | "info";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-[color:rgba(255,255,255,0.06)] text-[var(--ad-fg-muted)] border-[var(--ad-border)]",
  gold: "bg-[var(--ad-accent-bg)] text-[var(--ad-accent)] border-[var(--ad-border-accent)]",
  success: "bg-[var(--ad-success-bg)] text-[var(--ad-success)] border-[color:rgba(16,185,129,0.25)]",
  warning: "bg-[var(--ad-warning-bg)] text-[var(--ad-warning)] border-[color:rgba(245,158,11,0.25)]",
  danger: "bg-[var(--ad-danger-bg)] text-[var(--ad-danger)] border-[color:rgba(239,68,68,0.25)]",
  info: "bg-[var(--ad-info-bg)] text-[var(--ad-info)] border-[color:rgba(59,130,246,0.25)]",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium tracking-wide border whitespace-nowrap",
        BADGE_TONE[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// PageHeader — use at the top of every admin page
// ─────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-8 pb-6 mb-8 border-b border-[var(--ad-border)]">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--ad-fg)] leading-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-[var(--ad-fg-muted)]">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section (titled group of controls)
// ─────────────────────────────────────────────────────────────────
export function Section({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--ad-fg)] tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-[13px] text-[var(--ad-fg-muted)]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--ad-surface-2)] border border-[var(--ad-border)] flex items-center justify-center text-[var(--ad-fg-subtle)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-[14px] font-medium text-[var(--ad-fg)]">{title}</h3>
      {description && <p className="mt-1 text-[13px] text-[var(--ad-fg-muted)] max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stat card (for dashboard KPIs)
// ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, hint, trend, icon }: { label: string; value: ReactNode; hint?: string; trend?: { dir: "up" | "down"; text: string }; icon?: ReactNode }) {
  return (
    <Card padded className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] uppercase tracking-wide font-medium text-[var(--ad-fg-subtle)]">{label}</span>
        {icon && <span className="text-[var(--ad-fg-subtle)]">{icon}</span>}
      </div>
      <div className="text-[28px] font-semibold tracking-tight text-[var(--ad-fg)] leading-none">{value}</div>
      {(hint || trend) && (
        <div className="flex items-center gap-2 text-[12px]">
          {trend && (
            <span
              className={cx(
                "inline-flex items-center gap-1 font-medium",
                trend.dir === "up" ? "text-[var(--ad-success)]" : "text-[var(--ad-danger)]"
              )}
            >
              {trend.dir === "up" ? "↑" : "↓"} {trend.text}
            </span>
          )}
          {hint && <span className="text-[var(--ad-fg-muted)]">{hint}</span>}
        </div>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────
// Table (styled wrapper — use with semantic HTML)
// ─────────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("overflow-x-auto rounded-[12px] border border-[var(--ad-border)] bg-[var(--ad-surface)]", className)}>
      <table className="w-full text-[13px]">{children}</table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[var(--ad-surface-2)] border-b border-[var(--ad-border)]">
      {children}
    </thead>
  );
}
export function TH({ children, className, align }: { children: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return (
    <th
      className={cx(
        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ad-fg-subtle)]",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </th>
  );
}
export function TR({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={cx(
        "border-b border-[var(--ad-border)] last:border-b-0 transition-colors",
        onClick && "cursor-pointer hover:bg-[var(--ad-surface-2)]",
        className
      )}
    >
      {children}
    </tr>
  );
}
export function TD({ children, className, align }: { children: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return (
    <td
      className={cx(
        "px-4 py-3 text-[var(--ad-fg)]",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("admin-skeleton rounded-[6px]", className)} />;
}

// ─────────────────────────────────────────────────────────────────
// Divider
// ─────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cx("border-0 h-px bg-[var(--ad-border)]", className)} />;
}
