import Link from "next/link";

export function AuthBrand() {
  return (
    <Link className="inline-flex items-center justify-center" href="/" aria-label="Reviewly home">
      <span className="relative flex size-10 items-center justify-center rounded-[11px] bg-[#111216] text-white shadow-[0_5px_14px_rgba(17,18,22,0.15)]">
        <span className="absolute left-[10px] top-[11px] h-[15px] w-[15px] rotate-45 rounded-[4px] border-[3px] border-white border-b-0 border-l-0" />
        <span className="absolute bottom-[10px] left-[10px] h-[3px] w-[17px] rotate-[-43deg] rounded-full bg-white" />
      </span>
    </Link>
  );
}
