import { PixelIcon } from "./px";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <PixelIcon name="mic" size={20} />
      <span className="font-pixel text-xl">말모아</span>
    </span>
  );
}
