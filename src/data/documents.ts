type PdfPage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type PdfDocumentData = {
  pdf: string;
  downloadName: string;
  pages: readonly [PdfPage, ...PdfPage[]];
};

export const resumeDocument: PdfDocumentData = {
  pdf: "/resume.pdf",
  downloadName: "Minseok_Kim_CV_EN.pdf",
  pages: [
    { src: "/resume/page-1.webp", alt: "English CV, page 1 of 2", width: 1132, height: 1600 },
    { src: "/resume/page-2.webp", alt: "English CV, page 2 of 2", width: 1132, height: 1600 },
  ],
};

// A document is published as a PDF plus page previews, matching the Resume view.
// Keep it null until both artifacts exist so unfinished projects expose no broken links.
export const portfolioDocuments: Record<"beolmuri" | "towa", PdfDocumentData | null> = {
  beolmuri: {
    pdf: "/portfolio/beolmuri.pdf",
    downloadName: "Beolmuri_Portfolio.pdf",
    pages: [
      { src: "/portfolio/beolmuri/page-1.webp", alt: "별무리 포트폴리오, 1/4 페이지", width: 1132, height: 1600 },
      { src: "/portfolio/beolmuri/page-2.webp", alt: "별무리 포트폴리오, 2/4 페이지", width: 1132, height: 1600 },
      { src: "/portfolio/beolmuri/page-3.webp", alt: "별무리 포트폴리오, 3/4 페이지", width: 1132, height: 1600 },
      { src: "/portfolio/beolmuri/page-4.webp", alt: "별무리 포트폴리오, 4/4 페이지", width: 1132, height: 1600 },
    ],
  },
  towa: {
    pdf: "/portfolio/towa.pdf",
    downloadName: "TOWA_Portfolio.pdf",
    pages: [
      { src: "/portfolio/towa/page-1.webp", alt: "TOWA 프로젝트 포스터", width: 2264, height: 3200 },
    ],
  },
};
