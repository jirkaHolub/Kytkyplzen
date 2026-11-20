import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[520px] flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <span className="font-hand text-[40px] text-brand">Kytky Plzeň</span>
      <h1 className="text-[20px] font-extrabold">Stránka nebyla nalezena</h1>
      <p className="text-[14px] text-muted">Kytice z denní nabídky mívají krátkou životnost. Podívejte se, co je v nabídce dnes.</p>
      <Link href="/" className="inline-flex min-h-[48px] items-center rounded-[16px] bg-brand px-5 font-extrabold text-white">
        Dnešní nabídka
      </Link>
    </div>
  );
}
