"use client";

import type { ComponentProps, ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// shadcn 대화상자를 픽셀 모양(각진 모서리, 두꺼운 테두리, 계단 그림자)으로 감싼다.
export function PxDialog({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; title: ReactNode; description?: ReactNode; children?: ReactNode; className?: ComponentProps<"div">["className"] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("rounded-none border-[3px] border-border bg-card p-5 shadow-[6px_6px_0_0_var(--mk-px-edge)]", className)}>
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
