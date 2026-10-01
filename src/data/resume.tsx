import { Icons } from "@/components/icons";
import { House, Library } from "lucide-react";

export const DATA = {
  name: "김민석",
  initials: "김",
  headline: "안녕하세요,\nPysunn의 블로그입니다.",
  url: "https://pysunn.me",
  location: "수원",
  description: "AI 관련된 것이면 다 좋아합니다.",
  summary:
    "소프트웨어 및 컴퓨터공학을 전공하고 있는 4학년 학부생입니다. 현재는 AI SW 마에스트로 제17기 연수생으로 활동하고 있습니다. 문제 해결을 접할 수 있는 다양한 엔지니어링 분야에 관심이 많습니다.",
  researchInterests: "Edge AI System, LLM Inference Optimization, Vision-Language Models, On-Device AI, GPU Computing, Algorithm",
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
    discordUsername: "apdbumsb",
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
      logoUrl: "/logos/ai-sw-maestro.jpg",
      start: "2026.04",
      end: undefined,
      description:
        "AI 개발자로 iOS 온디바이스 small Language Model의 구현 및 최적화를 담당했습니다.",
      team: {
        name: "감히사람이에이전트를이기려해",
        members: [
          { name: "김민성", href: "https://github.com/Dongttak", role: "팀장" },
          { name: "김민석", href: "https://github.com/pysunn14", role: "" },
          { name: "김해울", href: "https://github.com/nox-katena", role: "" },
        ],
        mentors: ["박민재", "이세일", "박재선"],
      },
    },
    {
      company: "iKnow Lab, 아주대학교",
      href: "",
      badges: [],
      location: "수원",
      title: "학부연구생",
      logoUrl: "/logos/ajou-university.png",
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
      logoUrl: "/logos/cnoc.png",
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
      logoUrl: "/logos/ajou-university.png",
      start: "Mar 2021",
      end: "Feb 2027",
    },
  ],
  publication: {
    title: "Diagnosing Axis-Dependent Spatial Bias in Vision-Language Models",
    authors: "Minseok Kim, Hyunsouk Cho",
    venue: "Korea Computer Congress (KCC 2026) · Undergraduate Paper Competition · Jeju, South Korea",
    date: "Jun 2026",
  },
  projects: [
    {
      slug: "beolmuri",
      description: "별무리는 스마트폰에서 완전히 온디바이스로 실행되는 소형 언어 모델(sLM)을 통해 캐릭터와 대화하며 개인화된 경험을 제공하는 앱입니다. 그날의 중요한 기억을 매일 일기로 저장하며, 자연어로 캘린더 정리와 알람 설정 등의 네이티브 기능을 호출하여 작업하는 Agent 기능을 지원합니다.",
      title: "별무리 - 개인화 기억 기반 온디바이스 AI 캐릭터 에이전트 앱",
      href: "/portfolio/beolmuri",
      dates: "May 2026 – Present",
      technologies: ["Swift", "LiteRT-LM", "SQLite", "Gemma"],
      links: [
        {
          type: "Docs",
          href: "https://pysunn.me/docs-beolmuri-ai/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/mornye-minor-gallery/PetAI-AI",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      slug: "towa",
      title: "TOWA — AI 만화 번역 워크스테이션",
      href: "/portfolio/towa",
      dates: "Mar 2026 – Jun 2026",
      technologies: ["CRAFT", "OCR", "LLM", "OpenCV"],
      links: [
        {
          type: "Source",
          href: "https://github.com/trit-ajou/TOWA",
          icon: <Icons.github className="size-3" />,
        },
        {
          type: "SOFTCON",
          href: "https://softcon.ajou.ac.kr/works/works_prev.asp?uid=2330&wTerm=2026-1",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  honors: [
    {
      title: "제5회 대학 연합 아주 소중한 딥러닝 챌린지",
      logoUrl: "/logos/kaggle.png",
      dates: "Sep 2026",
      result: "3등상 · 전체 5위",
      description: "Dr. GRPO RLVR | SRGen Test-time Scailing | Majority Voting",
    },
    {
      title: "제25회 TOPCIT",
      logoUrl: "/logos/ajou-university.png",
      dates: "May 2026",
      result: "교내 성적우수자 입선 · 아주대학교 AI융합교육원장상",
      description: "",
    },
    {
      title: "아주대학교 프로그래밍 경시대회(APC) Div.1",
      logoUrl: "/logos/ajou-university.png",
      dates: "May 2026",
      result: "우수상 · 아주대학교 SW중심대학사업단장상",
      description: "",
    },
    {
      title: "2025 shake! 본선",
      logoUrl: "/logos/shake.png",
      dates: "Jan 2026",
      result: "21위 · 아주대학교 대표",
      description: "경인지역 7개 대학의 학교 대표가 참가한 개인전 본선에서 3문제를 해결했습니다.",
    },
    {
      title: "제4회 대학 연합 아주 소중한 딥러닝 챌린지",
      logoUrl: "/logos/kaggle.png",
      dates: "Oct 2025",
      result: "2등상 · 전체 3위",
      description: "5 Tasks Multitask Learning, CoT | 4bit QLoRA Fine-tuning",
    },
    {
      title: "Centroid Cup",
      logoUrl: "/logos/ansi.png",
      dates: "Sep 2025",
      result: "전체 6위 · 아주대학교 1등상 특별상 · 팀 낌민쎢",
      description: "국민대학교, 중앙대학교, 인하대학교, 아주대학교 연합 알고리즘 대회입니다.",
    },
    {
      title: "2025 아주톤",
      logoUrl: "/logos/ajou-university.png",
      dates: "May 2025",
      result: "우수상 · 아주대학교 SW융합교육원장상",
      description: "Blackboard 연동 일정 관리 크롬 확장 프로그램의 FastAPI 기반 LLM 챗봇 개발을 담당했습니다.",
    },
    {
      title: "모각소",
      logoUrl: "/logos/ajou-university.png",
      dates: "2024–2026",
      result: "우수상 2회 · 장려상 1회",
      description: "2024 동계와 2025 하계 우수상, 2026 하계 장려상을 받았습니다.",
    },
    {
      title: "율곡장학",
      logoUrl: "/logos/ajou-university.png",
      dates: "2021–2026",
      result: "4개 학기 수혜",
      description: "2021-1, 2025-1, 2025-2, 2026-1학기에 수혜했습니다. 총액 약 US$6,900.",
    },
    {
      title: "A.N.S.I. 알고리즘 소학회",
      logoUrl: "/logos/ansi.png",
      dates: "Mar 2024 – Sep 2026",
      result: "아주대학교 소학회 활동",
      description: "C++ 문제풀이 스터디와 ICPC 팀 연습에 참여하고 SCPC, UCPC 등 대회에 출전했습니다.",
    },
  ],
} as const;
