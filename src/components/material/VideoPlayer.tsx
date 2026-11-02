export function VideoPlayer({ videoUrl, status }: { videoUrl?: string; status: "available" | "coming_soon" }) {
  if (status !== "available" || !videoUrl) return <div className="grid aspect-video place-items-center bg-base-200 p-8 text-center"><div><span className="text-4xl">▶</span><p className="mt-3 font-bold">Video akan tersedia segera</p><p className="mt-1 text-sm text-base-content/60">Sementara itu, kamu bisa membaca ringkasan dan menyiapkan diri untuk latihan.</p></div></div>;
  return <div className="aspect-video overflow-hidden bg-black"><iframe className="h-full w-full" src={videoUrl} title="Video pembelajaran" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
}
