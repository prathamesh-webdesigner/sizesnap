import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

export function ToolCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col gap-2 p-4 transition-shadow hover:shadow-md focus-ring"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
              <Icon size={16} />
            </span>
          )}
          <span className="font-semibold text-[var(--color-text)]">{title}</span>
        </div>
        <ArrowRight size={16} className="shrink-0 text-[var(--color-text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" />
      </div>
      {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
    </Link>
  );
}
