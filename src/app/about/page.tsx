import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} — free browser-based tools for compressing and converting images and PDFs.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)]">About {siteConfig.name}</h1>

      <div className="prose-content mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
        <p>
          {siteConfig.name} provides free, browser-based file utilities that help people resize, convert and compress
          images and PDFs for common online applications, websites, forms, email and document submission requirements.
        </p>
        <p>
          The idea is simple: a lot of everyday tasks — uploading a passport photo, attaching a resume, submitting a
          signature to a bank form, or fitting a scanned document under an email attachment limit — are blocked by an
          arbitrary file size limit rather than a quality standard. {siteConfig.name} is built specifically to solve
          that problem: tell it the size you need, and it finds the best possible quality that fits.
        </p>
        <p>
          Wherever technically possible, files are processed entirely in your browser using the Canvas API and never
          uploaded to a server. PDF compression is the one exception — it requires temporary server-side processing to
          recompress embedded images and rebuild the file efficiently, and files are discarded immediately after
          processing. You can read the specifics in our{" "}
          <Link href="/privacy-policy" className="text-[var(--color-brand)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          {siteConfig.name} is free to use and does not require an account for any of its core functionality. The site
          may display advertising to support hosting costs; ads are never placed inside the active compression flow.
        </p>
        <p className="text-sm text-[var(--color-text-subtle)]">
          [Company / entity information can be added here — legal name, registration details, and any information the
          site owner wants to provide.]
        </p>
      </div>
    </div>
  );
}
