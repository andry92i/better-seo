import { SearchCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><SearchCheck className="size-5" /></span>
      {compact ? null : <span className="text-[17px] font-semibold tracking-tight">Better SEO</span>}
    </div>
  );
}
