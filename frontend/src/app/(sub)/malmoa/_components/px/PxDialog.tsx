"use client";

import type { ComponentProps, ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// shadcn 대화상자를 Windows 98 창(남색 제목 막대, 회색 입체 테두리)으로 감싼다.
export function PxDialog({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description?: ReactNode; children?: ReactNode; className?: ComponentProps<"div">["className"] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("w98-out gap-0 rounded-none border-0 bg-(--mk-face) p-[3px] text-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] [&>button]:top-[7px] [&>button]:right-2 [&>button]:text-white [&>button]:opacity-100", className)}>
        <DialogHeader className="w98-title px-1.5 py-1 text-left">
          <DialogTitle className="font-pixel text-[15px] text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 p-4">
          {description ? <DialogDescription className="text-black/80">{description}</DialogDescription> : null}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
