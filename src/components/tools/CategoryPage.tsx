import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ToolCard } from "@/components/ui/ToolCard";
import { AdPlaceholder } from "@/components/ui/AdPlaceholder";
import { Tool } from "@/types/tool";
import { AD_SLOTS } from "@/config/site";

export function CategoryPage({
  title,
  intro,
  tools,
}: {
  title: string;
  intro: string;
  tools: Tool[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-base text-[var(--color-text-muted)]">{intro}</p>

      <AdPlaceholder slot={AD_SLOTS.belowHeader} />

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.slug} href={`/${t.slug}`} title={t.title} description={t.metaDescription} />
        ))}
      </div>
    </div>
  );
}
