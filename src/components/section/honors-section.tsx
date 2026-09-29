import { DATA } from "@/data/resume";
import { Timeline, TimelineItem, TimelineConnectItem } from "@/components/timeline";

export default function HonorsSection() {
  return (
    <section id="honors" className="overflow-hidden">
      <div className="flex min-h-0 flex-col gap-y-6 w-full">
        <h2 className="text-xl font-bold">{DATA.sections.honors.heading}</h2>
        <Timeline>
          {DATA.honors.map((honor) => (
            <TimelineItem key={honor.title + honor.dates} className="w-full flex items-start justify-between gap-10">
              <TimelineConnectItem className="flex items-start justify-center">
                <div className="size-10 bg-card z-10 shrink-0 overflow-hidden p-1 border rounded-full shadow ring-2 ring-border flex-none">
                  <img src={honor.logoUrl} alt="" className="size-full object-contain" />
                </div>
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
