# BeSmartKids Math Visual Library (tahap 1)

Lokasi: `src/components/math-visual/index.tsx`

Komponen reusable: `ObjectCounter`, `TenFrame`, `NumberSequence`, `PlaceValue`, `NumberComparison`, dan `MathVisualCard`.

Bab 5 sudah mengimpor komponen-komponen ini di `src/components/learn/GradeOneChapterFive.tsx`.

Contoh:

```tsx
import { TenFrame, NumberSequence, PlaceValue } from "@/components/math-visual";

<TenFrame count={14} />
<NumberSequence sequence={[10, 11, null, 13]} />
<PlaceValue value={16} />
```

Batasan saat ini: belum mencakup FractionModel, NumberLine, Matching, PointSelect, Ordering, ConnectTheDots, DragAndDrop, InteractiveClock, grading bersama, dan penyimpanan progress. Belum diuji lint/build/browser. Jangan merge ke branch produksi sebelum diuji.

Jalankan lokal:

```sh
git fetch origin
git switch feat/grade1-chapter5-count-to-20
npm install
npm run lint
npm run build
npm run dev
```
