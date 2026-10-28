"use client";

import { GoogleButton } from "../../auth/components/GoogleButton";
import { LoginForm } from "../../auth/components/LoginForm";
import {
  Callout,
  CodeBlock,
  DocTable,
  H2,
  Ic,
  OL,
  P,
  Preview,
  PropsTable,
} from "../ui";

export function GoogleLoginDoc() {
  return (
    <>
      <P>
        로그인·가입 폼 아래에 <Ic>구글 계정으로 로그인하기</Ic>(가입 화면에서는{" "}
        <Ic>구글 계정으로 가입하기</Ic>) 버튼을 붙이는 옵션입니다. 구글 인증과
        토큰 발급은 <strong>서버가 전부 처리</strong>하고, 프론트는 서버 주소로
        이동했다가 돌아오는 화면만 맡습니다. 프론트에는 구글 클라이언트 ID나
        비밀값이 필요 없습니다.
      </P>
      <H2>켜기</H2>
      <CodeBlock
        title="meerkit.config.ts"
        code={`login: {\n  social: { google: true }, // 기본 false\n},`}
      />
      <P>
        켜면 로그인 창과 <Ic>AuthPanel</Ic>의 로그인·가입 폼 아래에 버튼이
        생깁니다. 두 버튼은 같은 주소로 이동하며, 처음 온 구글 계정이면 서버가
        계정을 만듭니다. 끄면 버튼도, 돌아오는 주소(
        <Ic>/auth/google/callback</Ic>)도 없습니다.
      </P>
      <H2>미리보기</H2>
      <Preview
        code={`<LoginForm onSubmit={login} onGoogle={() => (window.location.href = "/api/auth/google/login")} />`}
      >
        <div className="mx-auto w-full max-w-sm">
          <LoginForm onSubmit={() => {}} onGoogle={() => {}} />
        </div>
      </Preview>
      <H2>GoogleButton</H2>
      <Preview code={`<GoogleButton onClick={start} />`}>
        <div className="mx-auto w-full max-w-sm">
          <GoogleButton onClick={() => {}} />
        </div>
      </Preview>
      <PropsTable
        rows={[
          [
            "onClick",
            "() => void",
            "누르면 호출됩니다. 이 부품은 요청을 보내지 않습니다.",
            true,
          ],
          ["disabled", "boolean", "누를 수 없게 합니다."],
          ["label", "string", '버튼 글자. 기본 "구글 계정으로 로그인하기".'],
        ]}
      />
      <H2>흐름</H2>
      <OL>
        <li>
          사용자가 버튼을 누르면 브라우저가 <Ic>GET /api/auth/google/login</Ic>
          으로 이동합니다.
        </li>
        <li>
          서버가 구글 인증 화면으로 보내고, 구글이 서버의 콜백으로 돌려보냅니다.
        </li>
        <li>
          서버가 계정을 찾거나 만들고 <strong>리프레시 쿠키(httpOnly)</strong>를
          심은 뒤 프론트의 <Ic>/auth/google/callback</Ic>으로
          리다이렉트합니다.
        </li>
        <li>
          콜백 화면이 <Ic>POST /api/auth/refresh</Ic>로 액세스 토큰을 받아
          메모리에 두고 첫 화면으로 보냅니다.
        </li>
      </OL>
      <Callout>
        토큰은 주소(쿼리)에 싣지 않습니다. 주소에 남으면 기록·로그로 새어 나갈
        수 있어서, 쿠키로 심고 refresh로 받는 방식을 씁니다.
      </Callout>
      <H2>서버가 맞춰야 할 것</H2>
      <DocTable
        head={["구분", "내용"]}
        rows={[
          [
            "GET /api/auth/google/login",
            "구글 인증 화면으로 리다이렉트(302). state 값을 만들어 검증합니다.",
          ],
          [
            "구글 → 서버 콜백",
            "코드를 토큰으로 바꿔 구글 사용자 정보를 확인합니다 (서버 쪽 경로는 서버가 정합니다).",
          ],
          [
            "성공",
            "리프레시 쿠키를 심고 프론트 /auth/google/callback 으로 302.",
          ],
          [
            "실패",
            "프론트 /auth/google/callback?error=코드 로 302. 코드는 access_denied, state_mismatch 등 서버가 정합니다.",
          ],
          [
            "처음 온 구글 계정",
            "계정을 새로 만들지(약관 동의 포함) 서버 정책으로 정합니다. 새로 만든 계정의 역할은 VIEWER.",
          ],
        ]}
      />
      <Callout tone="warn">
        구글로만 가입한 계정에는 비밀번호가 없습니다. 마이페이지의 비밀번호
        변경·탈퇴 확인처럼 비밀번호를 묻는 화면은 이 경우를 따로 다뤄야 하며, 이
        옵션은 아직 그 부분을 포함하지 않습니다.
      </Callout>
    </>
  );
}
