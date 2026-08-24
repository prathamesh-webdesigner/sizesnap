import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, FileText, RefreshCw, IdCard, ShieldCheck, Zap, Gauge } from "lucide-react";
import { SearchBox } from "@/components/ui/SearchBox";
import { ToolCard } from "@/components/ui/ToolCard";
import { AdPlaceholder } from "@/components/ui/AdPlaceholder";
import { siteConfig, AD_SLOTS } from "@/config/site";
import { getToolBySlug } from "@/config/tools";

export const metadata: Metadata = {
  title: "Compress Images & PDFs to Exact KB or MB Size Online",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const POPULAR_IMAGE = ["compress-image-to-50kb", "compress-image-to-100kb", "compress-image-to-200kb", "compress-image-to-500kb"];
const POPULAR_PDF = ["compress-pdf-to-100kb", "compress-pdf-to-500kb", "compress-pdf-to-1mb"];
const CONVERSION = ["jpg-to-png", "png-to-jpg", "webp-to-jpg", "image-to-pdf"];
const APPLICATION = ["passport-photo-resizer", "signature-resizer", "compress-signature-to-20kb"];

function ToolRow({ title, slugs, href }: { title: string; slugs: string[]; href: string }) {
  const items = slugs.map((s) => getToolBySlug(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
        <Link href={href} className="text-sm font-medium text-[var(--color-brand)] hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => (
          <ToolCard key={t.slug} href={`/${t.slug}`} title={t.navLabel} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <section className="border-b border-[var(--color-border)] bg-gradient-to-b from-[var(--color-brand-soft)] to-[var(--color-bg)]">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Compress Files to the Size You Need
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
            Free online tools to compress images and PDFs to specific KB or MB sizes. Fast, private and free — no account required.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBox />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-subtle)]">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Private &amp; secure</span>
            <span className="flex items-center gap-1.5"><Zap size={14} /> No sign-up required</span>
            <span className="flex items-center gap-1.5"><Gauge size={14} /> Instant results</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6">
        <ToolRow title="Popular Image Tools" slugs={POPULAR_IMAGE} href="/image-tools" />
        <ToolRow title="Popular PDF Tools" slugs={POPULAR_PDF} href="/pdf-tools" />

        <AdPlaceholder slot={AD_SLOTS.midContent} />

        <ToolRow title="Image Conversion" slugs={CONVERSION} href="/conversion-tools" />
        <ToolRow title="Application Tools" slugs={APPLICATION} href="/application-tools" />

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Why SizeSnap</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <ImageIcon size={20} className="text-[var(--color-brand)]" />
              <h3 className="mt-3 font-semibold text-[var(--color-text)]">Precise size targeting</h3>
              <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                Tell us the exact KB or MB you need and we find the highest quality that fits — not just a generic &quot;compress&quot; button.
              </p>
            </div>
            <div className="card p-5">
              <FileText size={20} className="text-[var(--color-brand)]" />
              <h3 className="mt-3 font-semibold text-[var(--color-text)]">Images and PDFs</h3>
              <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                One place for the file compression tasks that come up again and again — forms, portals, email attachments and more.
              </p>
            </div>
            <div className="card p-5">
              <RefreshCw size={20} className="text-[var(--color-brand)]" />
              <h3 className="mt-3 font-semibold text-[var(--color-text)]">Convert and resize too</h3>
              <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                Switch formats, resize to exact dimensions, or combine images into a PDF — all in the same fast, free toolkit.
              </p>
            </div>
          </div>
        </section>

        <section className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IdCard size={22} className="text-[var(--color-brand)]" />
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Need a passport photo or signature resized?</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Purpose-built tools for common form and application requirements.</p>
            </div>
          </div>
          <Link href="/application-tools" className="btn-primary shrink-0 px-5 py-2.5 text-sm">
            Browse application tools
          </Link>
        </section>
      </div>
    </div>
  );
}
