import { PixelMeerkat } from "./px";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <PixelMeerkat level={1} size={32} />
      <span className="font-pixel text-2xl text-(--mk-gold)">말모아</span>
    </span>
  );
}
