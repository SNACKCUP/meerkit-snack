# 메일 발송 설정 가이드

가입 인증번호와 비밀번호 재설정 메일을 **실제로** 보내기 위한 설정 순서입니다.
코드는 이미 준비되어 있어서(`app.mail.send_mail`, `MAIL_*` 설정) 이 문서는 바깥 서비스와 `.env`만 다룹니다.

> 우리 설정 (2026-10-26)
> - 도메인 `meerkit.dev` (Porkbun)
> - 발송 업체 Resend (도쿄 리전)
> - 보내는 주소 `MeerKit <no-reply@mail.meerkit.dev>`
>
> Fork해서 쓰는 사람은 도메인만 자기 것으로 바꿔서 같은 순서로 하면 됩니다.

## 한눈에 보기

```text
1. 도메인 구입 (Porkbun)
2. 발송 업체에 하위 도메인 등록 (Resend: mail.<도메인>)
3. 업체가 알려 준 DNS 기록 4개를 도메인 DNS에 추가 (DKIM, SPF 2개, DMARC)
4. 업체 화면에서 Verified 확인
5. 보내기 전용 API 키 만들기
6. backend/.env 에 MAIL_* 설정
7. 테스트 메일 → Gmail "원본 보기"에서 SPF·DKIM·DMARC 모두 PASS 확인
```

Spring으로 비유하면, `JavaMailSender`가 외부 SMTP 서버에 접속해 보내는 구조입니다. 메일 서버를 직접 운영하지 않습니다.

## 1. 도메인 구입

- 아무 등록 업체나 괜찮습니다. 우리는 Porkbun을 썼고, `.dev`는 첫해 $8.75, 이후 약 $12.87/년입니다(2026-10 기준).
- 장바구니의 유료 추가 상품은 **필요 없습니다.**
  - Email hosting은 받은편지함 서비스이고, Web hosting은 Vercel·Render가 대신합니다.
- 무료 항목은 켜 둡니다: WHOIS Privacy, 자동 갱신.
- 구입 뒤 할 일:
  - 계정 2FA를 켭니다.
  - Domain Management에서 RENEW(자동 갱신)와 LOCK이 초록색인지 확인합니다.
  - 도메인 연락처 확인 메일이 오면 클릭합니다. 확인하지 않으면 도메인이 정지될 수 있습니다.
- `.dev`는 HTTPS만 허용됩니다(HSTS preload). Vercel·Render가 인증서를 자동으로 붙이므로 따로 할 일은 없습니다.

## 2. 발송 업체에 도메인 등록 (Resend)

1. resend.com 에 가입하고 2FA를 켭니다.
2. **Domains → Add domain**에 `mail.<도메인>`을 입력합니다(예: `mail.meerkit.dev`).
   - 루트 도메인 대신 **하위 도메인**을 씁니다. 메일 평판 문제가 생겨도 본 도메인(웹사이트)에 영향이 없습니다.
3. **Advanced options → Region**은 사용자와 가까운 곳으로 고릅니다(한국이면 Tokyo `ap-northeast-1`).
   - 나중에 바꾸려면 도메인을 지우고 다시 등록해야 하니 처음에 정합니다.
4. Enable Sending은 켜고, Enable Receiving은 끈 채로 둡니다(받기는 쓰지 않음).

## 3. DNS 기록 추가 (Porkbun)

Resend가 보여 주는 값을 **전체 복사**해서 넣습니다. 화면의 `[…]`는 표시만 줄인 것입니다.
Porkbun: Domain Management → 도메인 아래 **DNS** → Add record.

| Type | Host (Porkbun 입력 칸) | Answer | 역할 |
| --- | --- | --- | --- |
| TXT | `resend._domainkey.mail` | `p=MIGf…` (긴 공개키) | DKIM: 메일 서명 검증용 공개키 (JWT 서명 검증과 같은 원리) |
| CNAME | `rsend.mail` | `rsend-<리전>.forge.rmta.net` | SPF: Resend 서버가 우리 이름으로 보내도 된다는 허가 |
| CNAME | `send.mail` | `send.forge.rmta.net` | SPF·반송 처리 |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC: 인증 실패 메일 처리 정책 (`none` = 지켜보기) |

- Porkbun의 Host 칸은 뒤에 `.<도메인>`을 **자동으로 붙입니다.** 그래서 앞부분만 넣습니다. 전체 주소를 넣으면 이름이 두 번 붙어 실패합니다.
- TTL은 기본값(600)으로 둡니다.
- Porkbun 기본 기록(ALIAS·`*` → `pixie.porkbun.com`)은 지우지 않습니다. 웹 배포 때 정리합니다.
- Resend 화면의 "Go to Porkbun" 버튼은 자동 등록이 아니라 Porkbun으로 이동만 합니다. 직접 넣어야 합니다.
- 들어갔는지 확인하는 명령입니다.

  ```bash
  dig +short TXT resend._domainkey.mail.meerkit.dev
  dig +short CNAME send.mail.meerkit.dev
  dig +short TXT _dmarc.meerkit.dev
  ```

## 4. 인증 확인

Resend 화면에서 **I've already added the records**를 누르면 보통 몇 분 안에 모든 줄이 **Verified**가 됩니다.

## 5. API 키 만들기

Resend → **API Keys → Create API Key**:

| 칸 | 값 | 이유 |
| --- | --- | --- |
| Name | `meerkit-local` (운영은 `meerkit-prod`로 따로) | 용도별로 나눠 두면 샌 키만 지우면 됨 |
| Permission | **Sending access** (Full access 아님) | 새어도 도메인·키 관리는 못 함 (최소 권한) |
| Domain | `mail.<도메인>` | 이 주소로만 보낼 수 있게 제한 |

- `re_`로 시작하는 키는 **한 번만** 보입니다. 바로 `.env`에 붙여 넣습니다.
- 키는 채팅, 캡처, 커밋, 노션, 로그에 절대 남기지 않습니다. 샜다면 Resend에서 지우고 새로 만듭니다.

## 6. backend/.env 설정

```dotenv
MAIL_BACKEND=smtp
MAIL_SMTP_HOST=smtp.resend.com
MAIL_SMTP_PORT=587
MAIL_SMTP_STARTTLS=true
MAIL_SMTP_SSL=false
MAIL_SMTP_USERNAME=resend
MAIL_SMTP_PASSWORD=re_...        # 실제 키. .env 에만
MAIL_FROM=MeerKit <no-reply@mail.meerkit.dev>
```

- `.env`를 바꾸면 백엔드를 껐다 켜야 적용됩니다.
- 이 설정이면 로컬에서도 **진짜 메일이 나갑니다.** 메일 없이 개발할 때는 `MAIL_BACKEND=console`로 바꿉니다(로그로만 출력).
  - 받은 메일을 화면으로 보고 싶으면 Mailpit을 씁니다(`.env.example` 참고).
- pytest는 항상 `fake` 백엔드를 써서 이 설정과 상관없습니다.
- `APP_ENV=production`에서 `MAIL_BACKEND`가 `console`·`fake`면 서버가 시작을 거부합니다.

## 7. 테스트와 확인

1. 가입 화면의 인증번호 받기, 또는 `POST /api/auth/email/send-code`로 내 주소에 보냅니다.
2. Gmail에서 메일을 열고 ⋮ → **원본 보기**를 누릅니다. **SPF, DKIM, DMARC가 모두 PASS**면 끝입니다.
3. 오지 않으면 Resend → **Emails**에서 상태를 봅니다(Delivered / Bounced). 스팸함도 확인합니다.

## 자주 막히는 곳

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 메일이 안 나가고 백엔드 로그에만 본문이 찍힘 | `.env`에 키(`MAIL_SMTP_PASSWORD`)만 넣고 `MAIL_BACKEND=smtp` 등 나머지 `MAIL_*` 줄이 없음. 기본값 `console`로 동작 | 6장의 8줄을 모두 넣고 백엔드를 다시 시작 |
| `SMTPNotSupportedError: STARTTLS extension not supported` | 위와 같은 이유로 `MAIL_SMTP_HOST`가 기본값 `localhost:1025`(Mailpit)를 가리킴 | `MAIL_SMTP_HOST=smtp.resend.com`, `MAIL_SMTP_PORT=587`, `MAIL_SMTP_STARTTLS=true` 확인 |
| Resend에서 계속 Pending / Failed | Porkbun Host 칸에 전체 주소를 넣어 이름이 두 번 붙음(`…mail.meerkit.dev.meerkit.dev`), 또는 `[…]`로 줄어든 값을 그대로 복사 | Host는 앞부분만, 값은 전체 복사. `dig` 명령으로 확인 |
| `SMTPAuthenticationError` | 키를 잘못 붙여 넣음(앞뒤 공백·따옴표)이거나, 이미 지운 키 | Resend에서 키를 새로 만들어 다시 붙여 넣기 |
| 받은편지함 대신 스팸함 | DNS 기록 일부 누락, `MAIL_FROM` 주소가 인증한 도메인(`mail.<도메인>`)과 다름 | Gmail "원본 보기"에서 SPF·DKIM·DMARC가 모두 PASS인지 확인 |

설정만 빠르게 점검하려면(키는 출력하지 않음):

```bash
cd backend
uv run python -c "from app.core.config import settings as s; print(s.mail_backend, s.mail_smtp_host, s.mail_smtp_port, s.mail_from, 'key set:', bool(s.mail_smtp_password))"
```

## 운영 배포(S3) 때 할 일

- Resend에서 운영용 키 `meerkit-prod`(Sending access, `mail.<도메인>`)를 따로 만들어 Render 환경 변수에 넣습니다. 로컬 키는 운영에 쓰지 않습니다.
- Render 무료 플랜은 SMTP 포트가 막혀 있을 수 있습니다. 배포 뒤 테스트 메일로 확인하고, 막혀 있으면 그때 대안을 정합니다.
- 몇 주 운영해 문제가 없으면 DMARC를 `p=none` → `p=quarantine`으로 강화합니다.
- Resend 무료 사용량 한도를 대시보드에서 확인합니다.
