import { DATA } from "@/data/resume";
import { Timeline, TimelineItem, TimelineConnectItem } from "@/components/timeline";

export default function HonorsSection() {
  return (
    <section id="honors" className="overflow-hidden">
      <div className="flex min-h-0 flex-col gap-y-8 w-full">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">{DATA.sections.honors.label}</span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-3 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{DATA.sections.honors.heading}</h2>
          </div>
        </div>
        <Timeline>
          {DATA.honors.map((honor) => (
            <TimelineItem key={honor.title + honor.dates} className="w-full flex items-start justify-between gap-10">
              <TimelineConnectItem className="flex items-start justify-center">
                <div className="size-10 bg-card z-10 shrink-0 overflow-hidden p-1 border rounded-full shadow ring-2 ring-border flex-none" />
              </TimelineConnectItem>
              <div className="flex flex-1 flex-col justify-start gap-2 min-w-0">
                {honor.dates && (
                  <time className="text-xs text-muted-foreground">{honor.dates}</time>
                )}
                {honor.title && (
                  <h3 className="font-semibold leading-none">{honor.title}</h3>
                )}
                {honor.location && (
                  <p className="text-sm text-muted-foreground">{honor.location}</p>
                )}
                {honor.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
                    {honor.description}
                  </p>
                )}
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </section>
  );
}
