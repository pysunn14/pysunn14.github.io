import { Icons } from "@/components/icons";
import { House, Library } from "lucide-react";

export const DATA = {
  name: "김민석",
  initials: "김",
  headline: "안녕하세요,\nPysunn의 블로그입니다.",
  url: "https://pysunn.me",
  location: "수원",
  description:
    "LLM 최적화 관련 연구와 AI를 활용한 서비스 개발 모두에 관심이 있습니다. 현재는 AI·SW 마에스트로 연수생 프로젝트 활동을 진행하고 있습니다.",
  summary:
    "아주대학교에서 소프트웨어 및 컴퓨터공학을 전공합니다. 학부연구생으로 비전 언어 모델의 공간 추론 편향을 연구했고, AI·SW 마에스트로에서 iOS 온디바이스 AI 캐릭터 앱을 개발하고 있습니다.",
  researchInterests: "LLM 추론 최적화, 비전 언어 모델, 온디바이스 AI, GPU 컴퓨팅",
  avatarUrl: "",
  ogImage: "",
  sections: {
    about: { order: 1, enabled: true, heading: "About" },
    researchInterests: { order: 2, enabled: true, heading: "Research Interests" },
    work: { order: 3, enabled: true, heading: "Experience", presentLabel: "Present" },
    education: { order: 4, enabled: true, heading: "Education" },
    skills: { order: 5, enabled: true, heading: "Skills" },
    projects: {
      order: 6, enabled: true,
      heading: "Projects",
    },
    publication: { order: 7, enabled: true, heading: "Publication" },
    honors: {
      order: 8, enabled: true,
      heading: "Activities & Honors",
    },
    contact: {
      order: 9, enabled: true,
      heading: "Contact",
    },
  },
  skills: [
    { name: "C/C++" },
    { name: "Python" },
    { name: "Swift" },
    { name: "SQL" },
    { name: "PyTorch" },
  ],
  navbar: [
    { href: "/", icon: House, label: "Home" },
    { href: "/blog", icon: Library, label: "Blog" },
  ],
  contact: {
    email: "kminseok14@ajou.ac.kr",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/pysunn14",
        icon: Icons.github,
        navbar: true,
      },
      email: {
        name: "이메일",
        url: "mailto:kminseok14@ajou.ac.kr",
        icon: Icons.email,
        navbar: true,
      },
    },
  },

  work: [
    {
      company: "AI·SW 마에스트로 17기 (서울)",
      href: "",
      badges: [],
      location: "서울",
      title: "AI 개발자",
      logoUrl: "",
      start: "2026.04",
      end: undefined,
      description:
        "AI 개발자로 iOS 온디바이스 small Language Model의 구현 및 최적화를 담당했습니다.",
    },
    {
      company: "iKnow Lab, 아주대학교",
      href: "",
      badges: [],
      location: "수원",
      title: "학부연구생",
      logoUrl: "",
      start: "2025.07",
      end: "2026.03",
      description:
        "학부연구생으로 MLLM, Vision Language Models의 Spatial Reasoning을 연구했습니다.",
    },
    {
      company: "국군지휘통신사령부 CNOC",
      href: "",
      badges: [],
      location: "",
      title: "CERT병 · 육군 병장",
      logoUrl: "",
      start: "2022.03",
      end: "2023.09",
      description:
        "CERT병으로 네트워크 접근 통제를 감시하며 비인가 단말기를 차단하고, 상황 조치를 수행했습니다.",
    },
  ],
  education: [
    {
      school: "Ajou University",
      href: "https://www.ajou.ac.kr/",
      degree: "B.S. in Software and Computer Engineering (expected)",
      gpa: "GPA: 4.25/4.50 · Major GPA: 4.22/4.50",
      logoUrl: "",
      start: "Mar 2021",
      end: "Feb 2027",
    },
  ],
  publication: {
    title: "Diagnosing Axis-Dependent Spatial Bias in Vision-Language Models",
    authors: "Minseok Kim, Hyunsouk Cho",
    venue: "Korea Computer Congress (KCC 2026) · Undergraduate Paper Competition · Jeju, South Korea",
    date: "Jun 2026",
    description: "4종의 비전 언어 모델에서 방향 축에 따라 최대 52.12%p의 공간 추론 정확도 차이를 관찰했습니다. 2,000개 통제 합성 데이터로 패치 시퀀스 거리와 객체 간 어텐션의 관계를 분석했습니다(스피어만 상관계수 −0.782).",
  },
  projects: [
    {
      title: "별무리 — 온디바이스 AI 캐릭터 앱",
      href: "https://pysunn.me/docs-beolmuri-ai/",
      dates: "May 2026 – Present",
      description: "Swift와 LiteRT-LM으로 iOS 온디바이스 에이전트의 추론, 기억, 도구 실행 흐름을 구현했습니다. 의도 분류와 도구 선택으로 잘못된 도구 호출을 45.83%에서 4.17%로 낮췄고, 고정 프롬프트 KV 캐시 재사용으로 첫 토큰 응답 시간을 평균 4.920초에서 1.274초로 줄였습니다(iPhone 17 CPU, 30개 요청).",
      technologies: ["Swift", "LiteRT-LM", "SQLite", "Gemma"],
      links: [
        {
          type: "Docs",
          href: "https://pysunn.me/docs-beolmuri-ai/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "VRC AGENT — 3D 행동 아바타",
      href: "https://github.com/pysunn14/vrc-ardy-agent",
      dates: "Aug 2026 – Present",
      description: "VR 환경에서 음성 대화와 행동 생성을 아바타 실행으로 연결했습니다. 시각 정보가 필요할 때만 VLM을 호출하고, 플레이어 위치 추적은 YOLO로 분리했습니다.",
      technologies: ["STT", "LLM", "VLM", "ARDY", "YOLO"],
      links: [
        {
          type: "Source",
          href: "https://github.com/pysunn14/vrc-ardy-agent",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "TOWA — AI 만화 번역 워크스테이션",
      href: "https://github.com/trit-ajou/TOWA",
      dates: "Mar 2026 – Jun 2026",
      description: "텍스트 검출, OCR, LLM 번역, 인페인팅을 연결하는 Model Engine을 구현했습니다. 마스크 합성과 OpenCV 후처리로 MSE 기반 픽셀 훼손율을 23.15%에서 1.50%로 낮췄습니다.",
      technologies: ["CRAFT", "OCR", "LLM", "OpenCV"],
      links: [
        {
          type: "Source",
          href: "https://github.com/trit-ajou/TOWA",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "로컬 LLM 추론 최적화",
      href: "",
      dates: "2026",
      description: "Apple Silicon의 MLX 실행 환경에서 Qwen3.8-27B에 DFlash 기반 speculative decoding과 multi-token prediction을 적용해 디코드 속도를 약 17 token/s에서 45 token/s로 개선했습니다.",
      technologies: ["MLX", "LLM", "Speculative Decoding"],
      links: [],
      image: "",
      video: "",
    },
  ],
  honors: [
    {
      title: "제5회 대학 연합 아주 소중한 딥러닝 챌린지 · 3등상",
      dates: "Sep 2026",
      location: "전체 5위",
      description: "Qwen2.5-3B-Instruct 기반 수학 추론 대회에서 풀이 16개 생성과 유효 답안 다수결을 적용했습니다.",
    },
    {
      title: "제25회 TOPCIT · 교내 성적우수자 입선",
      dates: "May 2026",
      location: "아주대학교 AI융합교육원장상",
      description: "",
    },
    {
      title: "아주대학교 프로그래밍 경시대회(APC) Div.1 · 우수상",
      dates: "May 2026",
      location: "아주대학교",
      description: "",
    },
    {
      title: "2025 shake! 본선 · 21위",
      dates: "Jan 2026",
      location: "아주대학교 대표",
      description: "알고리즘 대회 본선에서 3문제를 해결했습니다. 대회 명칭은 2025 shake!이며 본선은 2026년 1월에 열렸습니다.",
    },
    {
      title: "제4회 대학 연합 아주 소중한 딥러닝 챌린지 · 2등상",
      dates: "Oct 2025",
      location: "전체 3위",
      description: "5개 멀티태스크의 모델 성능 개선을 위해 로컬 평가 환경을 만들고 CoT, few-shot prompting, 4bit QLoRA를 적용했습니다.",
    },
    {
      title: "Centroid Cup · 전체 6위",
      dates: "Sep 2025",
      location: "아주대학교 1등상 특별상 · 팀 낌민쎢",
      description: "국민대학교, 중앙대학교, 인하대학교, 아주대학교 연합 알고리즘 대회입니다.",
    },
    {
      title: "2025 아주톤 · 우수상",
      dates: "May 2025",
      location: "아주대학교",
      description: "Blackboard 연동 일정 관리 크롬 확장 프로그램의 FastAPI 기반 LLM 챗봇 개발을 담당했습니다.",
    },
    {
      title: "모각소 · 우수상 2회, 장려상 1회",
      dates: "2024–2026",
      location: "아주대학교",
      description: "2024 동계와 2025 하계 우수상, 2026 하계 장려상을 받았습니다.",
    },
    {
      title: "율곡장학 · 4개 학기",
      dates: "2021–2026",
      location: "아주대학교",
      description: "2021-1, 2025-1, 2025-2, 2026-1학기에 수혜했습니다. 총액 약 US$6,900.",
    },
    {
      title: "A.N.S.I. 알고리즘 소학회",
      dates: "Mar 2024 – Sep 2026",
      location: "아주대학교",
      description: "C++ 문제풀이 스터디와 ICPC 팀 연습에 참여하고 SCPC, UCPC 등 대회에 출전했습니다.",
    },
  ],
} as const;
