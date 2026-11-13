# Kartu kelas beranda didesain ulang (feat/class-card-redesign)

- Scope: homepage class cards in `src/components/home/ClassExplorer.tsx` (section "Mulai dari kelasmu"). Requested by the owner with a reference image: illustration panel on top, centred title and short text below, small corner radius, soft colours, math ornaments with motion.
- New `src/components/home/ClassCardArt.tsx`: per-class soft pastel panel with a math pattern (hexagon grid, graph paper, dots, triangle lattice, contour rings), three drifting math symbols, and a purpose-built line illustration per class (1 abacus, 2 number-line hops, 3 multiplication array, 4 fraction circle, 5 protractor, 6 percent ring, 7 algebra balance, 8 Pythagoras squares, 9 parabola, 10 unit circle, 11 statistics bars, 12 area under a curve).
- Motion reuses existing `bsk-drift`, `bsk-bob`, `bsk-spin-slow`, `bsk-draw`, `bsk-dash-flow` classes, so the existing reduced-motion rule turns it off. No change to `globals.css`.
- Card: `rounded-md`, thin border, soft hover lift; text "Kelas N", tagline, "Fase …", and "N materi →" or "Segera hadir". The link's accessible name is unchanged (`Kelas N, fase, N materi tersedia`). The previous dark/yellow colour panels and big numbers were removed.
- Validation: tsc, eslint, build; `scripts/smoke-homepage.mjs` passes at 320/390/768/1280 (class tabs, click path, no overflow, reduced motion); manual screenshots at 320/390/1280 reviewed, no console errors.
- Previous record: Kelas 8 Bab 6 PR #111 merged as c1f51f0c09b07597268dbe30564a7d0a975d5ce3; Vercel production deployment success.
