import Image from "next/image";

export function BrandMark() {
  return <Image src="/logo.png" alt="BeSmartKids" width={220} height={59} className="h-auto w-[170px] sm:w-[205px]" priority />;
}
