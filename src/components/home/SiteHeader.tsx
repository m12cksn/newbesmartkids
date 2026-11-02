import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <>
      <div className="border-b border-base-200 bg-base-100 px-5 py-2 text-center text-xs text-base-content/60 sm:px-8">
        Belajar sedikit demi sedikit, paham lebih lama.{" "}
        <a href="#kelas" className="font-bold text-success hover:underline">
          Pilih kelasmu -&gt;
        </a>
      </div>
      <div className="navbar border-b border-base-200 bg-base-100 px-5 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="navbar-start gap-3">
            <Link href="/" className="text-xl font-extrabold tracking-normal"><BrandMark /></Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 text-sm font-semibold text-base-content/60">
              <li>
                <a href="#kelas">Kelas</a>
              </li>
              <li>
                <a href="#cara-belajar">Cara belajar</a>
              </li>
              <li>
                <a href="#tentang">Tentang kami</a>
              </li>
            </ul>
          </div>
          <div className="navbar-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm hidden md:inline-flex"
            >
              Masuk
            </button>
            <a href="#kelas" className="btn btn-success btn-sm sm:btn-md">
              Mulai belajar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
