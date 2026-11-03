# Kelas 1 — Bab 1: Ayo Membilang sampai dengan 10

Status: Content plan awaiting implementation, QA, and owner review. Source: three evaluation-page images supplied by the teacher (book pages 36–38). Do not reproduce book illustrations verbatim; create original math SVG/React visuals. Source images are references, not yet committed assets.

## Learning objectives and teacher video script plan

Each subtopic includes: objective, child-friendly summary, teacher recording outline, original interactive demonstration, guided example, and practice. Video section must be first and show "Video pembelajaran segera hadir" until the teacher provides the recording; never insert an unrelated video.

### A. Menghitung, membaca, dan menulis bilangan
- Count 1–10 objects with one-to-one correspondence, touching each once; distinguish the number of objects from the symbol.
- Read 0–10 symbols as needed for empty sets, but chapter core is 1–10. Trace/write 1–10.
- Teacher script: "Setiap benda kita hitung satu kali. Satu, dua, tiga... Ada berapa semuanya? Angka terakhir menunjukkan banyak benda." Demonstrate 7 dots in a ten-frame; read "tujuh", trace 7.
- Interaction: tappable objects, counter, ten-frame and large traceable digit with keyboard-friendly alternative.
- Source evaluation Q1: two ten-frames with 10 cells each; first has 7 red dots, second 9. Original question variants count 6, 8, 9, 10; always match image count and key.

### B. Membandingkan banyak benda
- Compare sets by counting or matching pairs; use "lebih banyak", "lebih sedikit", "sama banyak".
- Teacher script: "Kita pasangkan buah satu-satu. Kelompok yang masih punya sisa berarti lebih banyak."
- Interaction: two original fruit groups, pair matching; compare without relying only on size/color.
- Source evaluation Q2: A has 4 fruits, B has 6; more B, fewer A. New variants include equal sets.

### C. Pasangan Bilangan
- Whole–part relation up to 10: two parts combine to a whole, and a whole can be separated into two groups. Include 0 as a part when suitable.
- Teacher script: "Ada 7 benda. Kita pisahkan 3 di kiri. Berapa di kanan? Empat. Tiga dan empat adalah pasangan bilangan tujuh."
- Interaction: movable counters into two trays, number bond tree; allow multiple valid pairs and show visual reconciliation.
- Source evaluation Q4: 9 toy cars -> choose two parts; 4 fruits -> choose two parts; 5 fruit -> parts 4 and 1. Q5: three different valid pairs totaling 7. Page 38: recursive split 8 -> 3 + 5, then 5 -> 3 + 2, then 3 -> 1 + 2. Validate every node and all descendants.
- Important: never confuse decomposing a number with only memorizing addition facts; include objects first.

### D. Menghitung Maju dan Mundur
- Say and complete sequences 1–10 forward and backward; find the number before, after, or between.
- Teacher script: "Saat maju, bilangan bertambah satu. Saat mundur, bilangan berkurang satu. Kita bisa berjalan di garis bilangan."
- Interaction: number line 1–10, step forward/back with clear current value; stop at boundaries.
- Source evaluation Q3: 4,5,_ -> 6; 7,_,9 -> 8; 10,_,8 -> 9.

## Original question bank blueprint (24 questions, 6 per subtopic)
All questions must be written in Indonesian for first graders. Store answer keys, explanatory feedback, difficulty, and visual specification. Use original illustrations and numbers; no exact reproduction of the photographed page.

| ID | Subtopic | Type | Prompt/visual | Answer | Difficulty |
|---|---|---|---|---|---|
| A01 | A | count | 6 red circles in 10-frame | 6 | mudah |
| A02 | A | count | 8 stars in 10-frame | 8 | mudah |
| A03 | A | select | Show 5 apples, choose numeral | 5 | mudah |
| A04 | A | match | Read 'sembilan', choose numeral | 9 | sedang |
| A05 | A | count | 10 buttons scattered, count each once | 10 | sedang |
| A06 | A | write | Show 7 dots, type numeral | 7 | sedang |
| B01 | B | compare | A 3 pears, B 5 pears; more? | B | mudah |
| B02 | B | compare | A 7 circles, B 4 circles; fewer? | B | mudah |
| B03 | B | compare | A 6, B 6; relationship? | sama banyak | mudah |
| B04 | B | compare | A 8 objects, B 9; more? | B | sedang |
| B05 | B | compare | A 5, B 2; fewer? | B | sedang |
| B06 | B | compare | A 10, B 7; relationship? | A lebih banyak | sedang |
| C01 | C | number bond | Whole 5, left 2, right blank | 3 | mudah |
| C02 | C | number bond | Whole 7, left 4, right blank | 3 | mudah |
| C03 | C | number bond | Whole 9, right 5, left blank | 4 | sedang |
| C04 | C | number bond | Whole 6, parts 1 and blank | 5 | sedang |
| C05 | C | number bond | Whole 8 -> 3 and ?, then ? -> 2 and ? | 5,3 | menantang |
| C06 | C | number bond | Whole 7, select all pairs from 1+6, 2+5, 3+3, 4+3 | 1+6,2+5,4+3 | menantang |
| D01 | D | sequence | 2,3,_ | 4 | mudah |
| D02 | D | sequence | 6,_,8 | 7 | mudah |
| D03 | D | sequence | 9,8,_ | 7 | mudah |
| D04 | D | sequence | 10,_,8 | 9 | sedang |
| D05 | D | sequence | _,5,6 | 4 | sedang |
| D06 | D | sequence | 4,3,_,1 | 2 | sedang |

## UX and technical acceptance
- Follow docs/UI_UX_RULES.md, blueprint-besmartkids-simple.md, and approved CoreSpeed-inspired design direction while keeping BeSmartKids branding, DaisyUI, green tokens, and Poppins. No copying CoreSpeed assets.
- Student route: /kelas/matematika-dasar-kelas-1/materi/membilang-sampai-dengan-10 (confirm class slug against repo before implementation).
- Video first, then four named sections, then evaluation and review. Prepare one short teacher recording script per subtopic, later combine into chapter video if desired.
- Evaluation one question per screen, touch/keyboard accessible, legible on mobile; never crop content to force viewport fit.
- React/SVG math visuals, reusable ten-frame, countable object group, number bond, and number line. Use local calculations; no database writes per answer.
- Split question content per chapter, lazy-load expensive widgets and video, do not import all grades' question banks. No unauthorized paid dependencies.
- Run lint/build and browser checks across mobile/tablet/desktop; audit answers and number of depicted objects; record any untested checks. No merge/deploy without owner approval.
