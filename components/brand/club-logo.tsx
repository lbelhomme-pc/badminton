import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClubLogoProps {
  className?: string;
  compact?: boolean;
  markOnly?: boolean;
  priority?: boolean;
  src?: string;
  alt?: string;
}

export function ClubLogo({ className, compact = false, markOnly = false, priority = false, src, alt = "" }: ClubLogoProps) {
  const imageSrc = src || (markOnly ? "/logos/cfvv-blason.png" : "/logos/cfvv-horizontal.png");

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        width={markOnly ? 56 : 164}
        height={markOnly ? 56 : 61}
        sizes={markOnly ? "48px" : "(min-width: 640px) 164px, 140px"}
        className={cn("block shrink-0 object-contain", markOnly ? "h-12 w-12" : "h-12 w-auto sm:h-14", compact && "h-11 sm:h-12")}
        aria-hidden={alt ? undefined : true}
        priority={priority}
      />
      <span className="sr-only">Club des fous du Volants Vendômois</span>
    </span>
  );
}
