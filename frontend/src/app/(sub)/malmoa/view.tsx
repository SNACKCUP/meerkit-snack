"use client";

// M0 확인용 임시 화면. M2에서 랜딩으로 교체한다.
export default function MalmoaHome() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-5 py-16">
      <h1 className="font-pixel text-4xl text-[#ffd23f]">말모아</h1>
      <p className="font-pixel text-xl">회의는 말로! 회의 내용은 글로!</p>
      <p className="text-muted-foreground">본문은 Pretendard로 읽기 편하게 둡니다. 가나다라마바사 ABC 123</p>
      <div className="flex flex-wrap gap-3">
        {[["#3ddc97", "MINT"], ["#ffd23f", "GOLD"], ["#ff4d8d", "PINK"], ["#4cc9f0", "SKY"]].map(([c, n]) => (
          <span key={n} className="font-pixel border-2 border-[#3b3478] px-3 py-1 text-[#14122b]" style={{ background: c }}>{n}</span>
        ))}
      </div>
    </main>
  );
}
