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
  beolmuri: null,
  towa: null,
};
