import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-text)]">Contact Us</h1>
      <p className="mt-3 text-base text-[var(--color-text-muted)]">
        Questions, feedback or a tool request? Send us a message and we&apos;ll get back to you.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
