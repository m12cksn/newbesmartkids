import { permanentRedirect } from "next/navigation";

// Alamat lama Bab 2 Kelas 5. Materi sekarang ada di halaman materi kelas.
export default function Page() {
  permanentRedirect("/kelas/pecahan-dan-pengukuran-kelas-5/materi/kpk-dan-fpb");
}
