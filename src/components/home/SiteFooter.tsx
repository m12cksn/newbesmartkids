import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="footer border-t border-base-200 bg-base-100 px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>
        <span className="text-xs text-base-content/50">
          Belajar sedikit demi sedikit, paham lebih lama.
        </span>
      </div>
    </footer>
  );
}
