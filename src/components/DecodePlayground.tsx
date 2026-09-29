import { useEffect, useState } from "react";
import "./decode-playground.css";
import BlurFade from "@/components/magicui/blur-fade";

// Fixed illustrative pieces, independent of a model tokenizer. Rates are demo
// controls, not benchmark measurements or claims about any particular model.
const SAMPLES = {
  ko: [
    "언어", " 모델", "은", " 토큰", "을", " 하나", "씩", " 생성", "합니다", ".",
    " 출력", " 속도", "가", " 빨라", "지면", " 같은", " 답변", "을", " 더", " 빨리", " 읽을", " 수", " 있습니다", ".",
    "\n\n", "문장", "이", " 나타", "나는", " 동안", " 슬라이더", "를", " 움직", "여", " 보세요", ".",
    " 내용", "은", " 그대로", "이고", ",", " 화면", "에", " 출력", "되는", " 속도", "만", " 바뀝", "니다", ".",
    "\n\n", "실제", " 추론", " 속도", "는", " 모델", ",", " 하드웨어", ",", " 문맥", " 길이", ",", " 디코딩", " 방식", "에", " 따라", " 달라", "집니다", ".",
    " 이", " 예시", "는", " 브라우저", "에서", " 출력", " 속도", "만", " 재현", "합니다", ".",
  ],
  en: [
  "Large", " language", " models", " generate", " text", " one", " token", " at", " a", " time", ".",
  " A", " faster", " decode", " rate", " makes", " the", " same", " response", " arrive", " sooner", ".",
  "\n\n", "Move", " the", " slider", " while", " this", " text", " is", " appearing", " to", " feel", " the", " difference", ".",
  " The", " content", " stays", " the", " same", ";", " only", " its", " delivery", " speed", " changes", ".",
  "\n\n", "Real", " inference", " speed", " depends", " on", " the", " model", ",", " hardware", ",", " context", " length", ",",
  " and", " decoding", " method", ".", " This", " playground", " simulates", " the", " output", " stream", " in", " your", " browser", ".",
  ],
};

type Language = keyof typeof SAMPLES;
const COPY = {
  ko: {
    title: "디코드 속도",
    description: "실제 모델을 실행하지 않는 출력 속도 시뮬레이션입니다.",
    speed: "출력 속도",
    language: "언어 선택",
    status: { running: "출력 중", done: "완료" },
    output: "출력", outputLabel: "시뮬레이션 출력", progress: "출력 진행률",
  },
  en: {
    title: "Decode speed",
    description: "An output-speed simulation without running a real model.",
    speed: "Output speed",
    language: "Language",
    status: { running: "Generating", done: "Complete" },
    output: "Output", outputLabel: "Simulated output", progress: "Output progress",
  },
};
const BUTTON = "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400 active:bg-secondary disabled:cursor-not-allowed disabled:opacity-40";

export default function DecodePlayground() {
  const [language, setLanguage] = useState<Language>("ko");
  const [speed, setSpeed] = useState(30);
  const [count, setCount] = useState(0);
  const tokens = SAMPLES[language];
  const copy = COPY[language];
  const status = count === tokens.length ? "done" : "running";

  useEffect(() => {
    // Each rate/language selection owns a fresh stream. Cleanup prevents the
    // previous selection's animation from writing into the new stream.
    let position = 0;
    let timestamp = performance.now();
    let frame = 0;
    function tick(now: number) {
      position = Math.min(tokens.length, position + (now - timestamp) * speed / 1000);
      timestamp = now;
      setCount(Math.floor(position));
      if (position < tokens.length) frame = requestAnimationFrame(tick);
    }
    function onVisibilityChange() {
      // Keep the visible output continuous when returning from another tab.
      cancelAnimationFrame(frame);
      if (!document.hidden && position < tokens.length) {
        timestamp = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    if (!document.hidden) frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [language, speed]);

  function changeLanguage(next: Language) {
    if (next === language) return;
    setCount(0);
    setLanguage(next);
  }

  return (
    <BlurFade delay={0.08}>
      <section lang={language} aria-labelledby="decode-title" className="space-y-8">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 id="decode-title" className="text-lg font-semibold">{copy.title}</h2>
            <div role="group" aria-label={copy.language} className="flex shrink-0 items-center gap-1">
              {(["ko", "en"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={value === "ko" ? "한국어" : "English"}
                  aria-pressed={language === value}
                  onClick={() => changeLanguage(value)}
                  className={`${BUTTON} min-w-11 px-3 ${language === value ? "bg-muted text-sky-700 dark:text-sky-400" : "text-muted-foreground"}`}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <label htmlFor="decode-speed" className="text-sm text-muted-foreground">{copy.speed}</label>
            <output htmlFor="decode-speed" className="font-mono text-3xl tabular-nums tracking-tight">
              {speed}<span className="ml-2 font-sans text-sm tracking-normal text-muted-foreground">tokens/s</span>
            </output>
          </div>
          <input
            id="decode-speed"
            type="range"
            min={5}
            max={200}
            step={1}
            value={speed}
            aria-valuetext={language === "ko" ? `초당 ${speed} 토큰` : `${speed} tokens per second`}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (next === speed) return;
              setCount(0);
              setSpeed(next);
            }}
            className="decode-range block h-11 w-full cursor-ew-resize"
          />
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground" aria-hidden="true"><span>5</span><span>200</span></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{copy.output}</span>
            <span role="status">{copy.status[status]}</span>
          </div>
          <p tabIndex={0} className={`h-64 overflow-y-auto whitespace-pre-wrap ${language === "ko" ? "font-sans" : "font-mono"} text-sm leading-7 [overflow-wrap:anywhere] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400`} aria-label={copy.outputLabel}>
            {tokens.slice(0, count).join("")}
            {status === "running" && <span className="ml-0.5 text-sky-600 dark:text-sky-400" aria-hidden="true">▍</span>}
          </p>
          <progress aria-label={copy.progress} value={count} max={tokens.length} className="decode-progress mt-5 block h-1 w-full" />
        </div>

      </section>
    </BlurFade>
  );
}
