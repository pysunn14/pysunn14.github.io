# pysunn14.github.io

## Portfolio PDF

`/portfolio`는 프로젝트 목록이며, 홈과 목록의 프로젝트 카드는 `/portfolio/beolmuri`, `/portfolio/towa`로 연결된다. Docs, Source, SOFTCON 링크는 별도로 유지한다.

Resume과 프로젝트 문서는 `src/components/PdfDocument.astro`를 함께 사용한다. PDF가 없는 프로젝트는 `src/data/documents.ts`의 문서 항목을 `null`로 두며, 화면에는 준비 중 상태만 표시한다.

PDF를 추가할 때는 다음 파일과 데이터를 함께 등록한다.

1. PDF 원본: `public/portfolio/<slug>.pdf`
2. 페이지 미리보기: `public/portfolio/<slug>/page-1.webp` 등
3. `src/data/documents.ts`의 해당 항목: `pdf`, `downloadName`, `pages`의 이미지 경로, 대체 텍스트, 너비와 높이

파일 등록 후 타입 검사와 빌드, 문서의 페이지 표시 및 Open PDF / Download PDF 링크를 확인한다.
