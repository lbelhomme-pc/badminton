import Link from "next/link";
import { Pencil } from "lucide-react";

export function AdminEditLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      data-admin-edit-action
      className="absolute right-3 top-3 z-[60] hidden items-center gap-2 rounded-full border-2 border-white bg-[#0097a9] px-3 py-2 font-display text-xs font-black text-white shadow-[0_8px_22px_rgba(3,29,43,0.28)] hover:bg-[#007f8f]"
      aria-label={`Modifier : ${label}`}
    >
      <Pencil className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Modifier</span>
    </Link>
  );
}
