import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "How It Works",
  description: `How ${siteConfig.name}'s compression tools work, and how your files are handled.`,
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  { title: "1. Choose a tool", body: "Pick a preset target size (like 100 KB) or a custom-size tool if your limit doesn't match a preset." },
  { title: "2. Upload your file", body: "Drag and drop, or tap to browse from your device. Nothing uploads until you choose a file." },
  { title: "3. Set your target", body: "Confirm or adjust the target size in KB or MB." },
  { title: "4. Compress", body: "The tool analyzes your file and iteratively adjusts quality (and, if needed, dimensions) until it fits your target." },
  { title: "5. Preview and download", body: "Check the before/after comparison and file size, then download — or compress another file." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)]">How It Works</h1>
      <p className="mt-3 text-base text-[var(--color-text-muted)]">
        {siteConfig.name} is built to get you from &quot;a file that&apos;s too big&quot; to &quot;a file that fits&quot; in as few steps as
        possible, without an account and without sacrificing more quality than necessary.
      </p>

      <ol className="mt-8 space-y-6">
        {STEPS.map((step) => (
          <li key={step.title} className="card p-5">
            <h2 className="font-semibold text-[var(--color-text)]">{step.title}</h2>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
        <h2 className="text-lg font-bold text-[var(--color-text)]">The image compression algorithm</h2>
        <p>
          For images, the compressor first tries adjusting JPEG or WebP quality using a binary search: it repeatedly
          tests quality settings to find the highest one whose output size is at or below your target. Only if quality
          reduction alone can&apos;t reach the target does it reduce the image&apos;s pixel dimensions, then repeats the
          quality search at the smaller size. This order — quality first, dimensions second — keeps your image as
          close to its original resolution as possible.
        </p>
        <h2 className="text-lg font-bold text-[var(--color-text)]">The PDF compression approach</h2>
        <p>
          For PDFs, the size is driven almost entirely by embedded images. The compressor extracts each embedded
          image, recompresses it (and downsamples very high-resolution images) using the same quality-search approach,
          and rebuilds the PDF with a more compact internal structure. Unnecessary metadata is stripped along the way.
          Text and layout are never altered.
        </p>
      </div>
    </div>
  );
}
