import { Info } from "lucide-react";

type Kind = "terms" | "privacy";

interface Section {
  title: string;
  body: string;
}

// 샘플 문구다. 서비스에 맞게 이 파일의 내용을 교체하거나, 별도 약관 페이지 주소로 바꿔 쓴다.
const content: Record<Kind, { title: string; sections: Section[] }> = {
  terms: {
    title: "이용약관",
    sections: [
      { title: "제1조 (목적)", body: "이 약관은 서비스 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임 사항을 정하는 것을 목적으로 합니다." },
      { title: "제2조 (회원가입)", body: "이용자는 회사가 정한 절차에 따라 필요한 정보를 입력하고 약관에 동의함으로써 회원으로 가입할 수 있습니다." },
      { title: "제3조 (계정 관리)", body: "회원은 자신의 계정과 비밀번호를 안전하게 관리할 책임이 있으며, 제3자에게 이를 양도하거나 공유할 수 없습니다." },
      { title: "제4조 (서비스 이용)", body: "회원은 부여된 역할과 권한의 범위 안에서 서비스를 이용할 수 있으며, 권한을 초과하는 접근을 시도해서는 안 됩니다." },
      { title: "제5조 (탈퇴 및 이용 제한)", body: "회원은 언제든지 탈퇴를 요청할 수 있습니다. 회사는 약관을 위반한 회원의 이용을 제한할 수 있습니다." },
    ],
  },
  privacy: {
    title: "개인정보 처리방침",
    sections: [
      { title: "1. 수집하는 개인정보", body: "아이디, 이름, 이메일, 비밀번호(암호화하여 저장)를 필수로 수집하며, 서비스에 따라 전화번호, 주소, 생년월일 등을 선택적으로 수집할 수 있습니다." },
      { title: "2. 수집 및 이용 목적", body: "회원 식별, 로그인 및 계정 관리, 권한 부여, 고객 문의 응대를 위해 이용합니다." },
      { title: "3. 보유 및 이용 기간", body: "회원 탈퇴 시까지 보유하며, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다." },
      { title: "4. 제3자 제공 및 위탁", body: "이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 위탁이 필요한 경우 별도로 고지합니다." },
      { title: "5. 이용자의 권리", body: "이용자는 언제든지 자신의 개인정보를 조회, 수정하거나 삭제(탈퇴)를 요청할 수 있습니다." },
    ],
  },
};

export function LegalPage({ kind }: { kind: Kind }) {
  const { title, sections } = content[kind];
  return (
    <div className="min-h-screen">
      <main className="mk-rise mx-auto w-full max-w-2xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-5 flex gap-3 rounded-2xl border bg-surface p-4 text-[13px] leading-6 text-foreground/80 shadow-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <p>이 내용은 <strong>샘플 문구</strong>입니다. 실제 서비스에서는 법무 검토를 거친 내용으로 교체해야 합니다.</p>
        </div>
        <div className="mt-8 grid gap-7">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-[15px] leading-7 text-foreground/80">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
