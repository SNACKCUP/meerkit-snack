"use client";

import { ArrowUp, Check, ChevronDown, Paperclip, Square, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatBytes, matchesAccept } from "@/components/ui/file-dropzone";
import { cn } from "@/lib/utils";

export interface AiAgent {
  id: string;
  label: string;
  description?: string;
}

interface AiPromptInputProps {
  /** 보내기를 누르면 글과 첨부파일을 전달한다. 기본으로 입력창을 비운다 */
  onSubmit: (message: string, files: File[]) => void;
  /** 응답을 받는 중이면 true. 보내기 버튼이 중지 버튼으로 바뀌고 글로우가 켜진다 */
  pending?: boolean;
  /** pending 중에 중지 버튼을 누르면 호출한다. 없으면 보내기만 잠긴다 */
  onStop?: () => void;
  placeholder?: string;
  /** 고를 수 있는 에이전트(모델). 없으면 선택 버튼을 보여 주지 않는다 */
  agents?: AiAgent[];
  agent?: string;
  onAgentChange?: (id: string) => void;
  maxLength?: number;
  /** false면 첨부 버튼을 숨긴다. 기본 true */
  attachments?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  /** 입력창 아래의 컬러 글로우. 포커스 중이거나 응답을 기다리는 동안 켜진다. 기본 true */
  glow?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const MAX_HEIGHT = 200;

// AI에게 질문하거나 코멘트를 남기는 입력 폼. 글 입력, 파일 첨부, 에이전트 선택, 보내기/중지를 한 덩어리로 묶었다.
export function AiPromptInput({
  onSubmit,
  pending,
  onStop,
  placeholder = "무엇이든 물어보세요",
  agents,
  agent,
  onAgentChange,
  maxLength = 2000,
  attachments = true,
  accept,
  maxFiles = 4,
  maxSizeMB = 10,
  glow = true,
  disabled,
  autoFocus,
  className,
}: AiPromptInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [focused, setFocused] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const current = agents?.find((a) => a.id === agent) ?? agents?.[0];
  const canSend = text.trim().length > 0 && !pending && !disabled;
  const nearLimit = text.length >= maxLength * 0.8;

  function resize() {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }

  function send() {
    if (!canSend) return;
    onSubmit(text.trim(), files);
    setText("");
    setFiles([]);
    setErrors([]);
    requestAnimationFrame(resize);
  }

  function addFiles(list: FileList | null) {
    const problems: string[] = [];
    const next = [...files];
    for (const file of Array.from(list ?? [])) {
      if (!matchesAccept(file, accept)) problems.push(`${file.name}: 허용되지 않는 형식입니다.`);
      else if (file.size > maxSizeMB * 1024 * 1024) problems.push(`${file.name}: ${maxSizeMB}MB를 넘습니다.`);
      else if (next.length >= maxFiles) problems.push(`첨부는 최대 ${maxFiles}개까지입니다.`);
      else next.push(file);
    }
    setFiles(next);
    setErrors(problems);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="mk-glow" data-active={glow && (focused || !!pending)} aria-hidden />
      <div
        className={cn(
          "relative grid gap-2 rounded-3xl border bg-surface p-3 shadow-soft transition-[box-shadow,border-color] duration-300",
          focused && "border-brand/40 shadow-[0_0_0_3px_color-mix(in_srgb,var(--mk-brand)_12%,transparent),var(--mk-shadow-soft)]",
          disabled && "opacity-60",
        )}
      >
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="mk-swap flex items-center gap-1.5 rounded-full border bg-card py-1 pl-2.5 pr-1 text-xs">
                <span className="max-w-40 truncate">{file.name}</span>
                <span className="text-muted-foreground">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  aria-label={`${file.name} 삭제`}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-full p-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <textarea
          ref={areaRef}
          aria-label="AI에게 보낼 메시지"
          rows={1}
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            resize();
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            // 한글 조합 중의 Enter는 글자 확정이므로 보내지 않는다
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          className="mk-scroll max-h-[200px] min-h-7 w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center gap-1.5">
          {attachments && (
            <>
              <Button type="button" variant="ghost" size="icon" aria-label="파일 첨부" disabled={disabled || files.length >= maxFiles} onClick={() => fileRef.current?.click()}>
                <Paperclip />
              </Button>
              <input ref={fileRef} type="file" multiple accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </>
          )}

          {agents && agents.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="에이전트 선택"
                  disabled={disabled}
                  className="group flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50"
                >
                  {current?.label}
                  <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {agents.map((a) => (
                  <DropdownMenuItem key={a.id} onSelect={() => onAgentChange?.(a.id)} className="items-start">
                    <span className="grid flex-1 gap-0.5">
                      <span className="font-medium">{a.label}</span>
                      {a.description && <span className="text-xs font-normal text-muted-foreground">{a.description}</span>}
                    </span>
                    {a.id === current?.id && <Check className="mt-0.5 !text-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <span className="ml-auto flex items-center gap-2">
            {nearLimit && (
              <span className={cn("text-xs tabular-nums", text.length >= maxLength ? "text-destructive" : "text-muted-foreground")}>
                {text.length}/{maxLength}
              </span>
            )}
            {pending && onStop ? (
              <Button type="button" size="icon" aria-label="응답 중지" onClick={onStop} className="rounded-full">
                <Square className="fill-current" />
              </Button>
            ) : (
              <Button type="button" size="icon" aria-label="보내기" disabled={!canSend} onClick={send} className="rounded-full">
                <ArrowUp />
              </Button>
            )}
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="mk-swap mt-2 grid gap-0.5 px-2 text-xs text-destructive">
          {errors.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
    </div>
  );
}
