import { DATA } from "@/data/resume";

export default function ContactSection() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-xl font-bold">{DATA.sections.contact.heading}</h2>
      <p className="text-sm text-muted-foreground">{DATA.sections.contact.text}</p>
      <a
        href={`mailto:${DATA.contact.email}`}
        className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {DATA.contact.email}
      </a>
    </div>
  );
}
