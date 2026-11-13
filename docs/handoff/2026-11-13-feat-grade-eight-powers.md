# Kelas 8 Bab 1 Bilangan Berpangkat (feat/grade-eight-powers)

- Scope: Buku Siswa Matematika SMP/MTs Kelas VIII (Kurikulum Merdeka 2022) hlm. 1–44. Subtopik A Bilangan Berpangkat Bulat, B Bilangan Bentuk Akar, C Penulisan Bentuk Baku. First Kelas 8 chapter, so it is the free sample chapter for Kelas 8 (lessons and practice open; evaluation needs a Kelas 8 package).
- New chapter via the registry: `src/chapters/kelas-8-bilangan-berpangkat/` (slug `bilangan-berpangkat`), shown on `/kelas/hubungan-geometri-kelas-8`. No shared-file edits.
- SMP depth (owner emphasised) and everyday examples: 10 sections, each with steps, a "Dalam kehidupan sehari-hari" box, a worked example, and its own lab.
  - A.1 Pengertian (memory 2^10 byte, Rubik cube 3^3; lab: base/exponent with sign rule and −2^4 vs (−2)^4).
  - A.2 Perkalian dan pembagian (daily data quota, SSD films; lab: factor chips, cancelled pairs when dividing).
  - A.3 Pangkat dari pangkat (warehouse boxes; lab: n groups of m factors).
  - A.4 Pangkat nol dan negatif (radio wavelength, amoeba; lab: power ladder 10^3 … 10^−3 with fractions and decimals).
  - B.1 Akar (handkerchief area 625 cm²; lab: square area → side, perfect square or simplified root).
  - B.2 Menyederhanakan dan menjumlah akar (frame perimeter; lab: largest square factor).
  - B.3 Perkalian dan pembagian akar (paper and tile area; lab: rectangle a√p × b√q).
  - B.4 Merasionalkan penyebut (lab: √a, a + √b, √a + √b with conjugate steps).
  - C.1 Bentuk baku (Earth mass, mining truck; lab: shift the decimal point).
  - C.2 Operasi bentuk baku (speed of light; lab: multiply/divide and normalise).
- Files: `src/data/grade-eight-powers.ts`, `src/components/learn/GradeEightPowers.tsx`, `src/components/learn/GradeEightPowersArt.tsx` (math renderer for ^{…}, √{…}, {a/b}; square, rectangle, Rubik cube, virus splitting, info cards), `scripts/verify-grade-eight-powers.mjs`, `scripts/smoke-grade-eight-powers.mjs`, `.github/workflows/grade-eight-powers-qa.yml`.
- Answer types as in the book: power (base + exponent, or exponent only), fraction in lowest terms, value, a√b in simplest form, rationalised result (terms over an integer denominator; checked by value and form: square-free radicands, like terms combined, gcd 1), standard form a × 10^n with 1 ≤ a < 10, true/false (Ayo Berpikir Kritis), choice.
- Practice 4 per subtopic (12). Evaluation 24 (A/B/C alternating, 8 each; 8 Sedang, 9 Menantang, 7 Sangat menantang): book-style items with new numbers plus own items from the chapter (data quota/SSD, frame, rice grains, light distance, flashdisk 3 × 2^n bytes, virus splitting 2^60 vs 3^30, blood donors, seconds in 50 years).
- Validation: verify evaluates every key from the expression in its label (a small parser for ^{…}, √{…}, {a/b}; 56 checks) and recomputes the word problems; wrong values rejected per answer type. tsc, eslint, build; Playwright at 320/390/768/1280: class-page link, all 10 labs, 12 practice (1 intentional wrong), 24 evaluation (1 intentional wrong), score and review. Screenshots reviewed; fixed huge-number display (6e+21), cm² in SVG, virus diagram width.
- Security headers / PIN change record: PR #105 merged as 0554cda83a7fa693d01ea7064520a2396d8b0281; Vercel production deployment success.
