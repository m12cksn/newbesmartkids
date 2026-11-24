import { PlayCircle } from "lucide-react";
import { TUTORIAL_VIDEO_URL, TUTORIAL_VIDEO_VERTICAL, youtubeId } from "@/lib/tutorial";

/** Video panduan dari YouTube (mode tanpa kuki). Sebelum alamat diisi, tampil panel yang jujur menyebut video sedang disiapkan. */
export function TutorialVideo() {
  const id = youtubeId(TUTORIAL_VIDEO_URL);
  const box = `${TUTORIAL_VIDEO_VERTICAL ? "aspect-[9/16] max-w-[360px] lg:max-w-[min(360px,calc((100vh-8rem)*9/16))]" : "aspect-video"} relative mx-auto w-full overflow-hidden rounded-2xl border border-base-300 shadow-sm`;
  if (!id) return <div className={`${box} flex flex-col items-center justify-center gap-3 bg-base-100 p-6 text-center`} data-testid="tutorial-placeholder">
    <PlayCircle className="size-12 text-success" strokeWidth={1.5} aria-hidden="true" />
    <p className="font-bold">Video panduan sedang disiapkan</p>
    <p className="text-sm text-base-content/70">Sambil menunggu, ikuti langkah tertulis di halaman ini.</p>
  </div>;
  return <figure className="w-full">
    <div className={`${box} bg-neutral`}>
      <iframe className="absolute inset-0 size-full" src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`} title="Video cara memakai BeSmartKids" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" data-testid="tutorial-video" />
    </div>
    <figcaption className="mt-2 text-center text-sm"><a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="link text-success">Buka di YouTube</a></figcaption>
  </figure>;
}
