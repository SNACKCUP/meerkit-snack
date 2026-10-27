# 파일 저장소 설정 가이드 (프로필 이미지 등)

프로필 이미지처럼 **누구나 주소로 열 수 있는 파일**을 저장하는 설정입니다.
코드는 킷의 `app.storage`(S3 호환 방식)에 있고, 이 문서는 바깥 서비스와 `.env`만 다룹니다.

> 우리 설정 (2026-10-27)
> - 로컬: Supabase CLI(`npm run db:start`)에 들어 있는 Storage
> - 운영: 운영 DB와 같은 Supabase 프로젝트의 Storage, 버킷 `meerkit-public`(공개 읽기)
>
> S3 호환이라 AWS S3, Cloudflare R2, MinIO로 바꿀 때도 `.env`의 `STORAGE_*`만 바꾸면 됩니다.

## 한눈에 보기

```text
로컬
1. supabase/config.toml 에 버킷이 이미 적혀 있음 → npm run db:stop && npm run db:start
   (버킷이 안 보이면 npx supabase seed buckets --local)
2. npx supabase status 로 S3 키 확인 → backend/.env 에 STORAGE_* 넣기
3. 백엔드 재시작 → 내 정보에서 이미지 올리기

운영 (배포 때 한 번)
1. Supabase 대시보드에서 버킷 meerkit-public 만들기 (Public 켜기, 2MB, image/webp)
2. Storage 설정에서 S3 접속 정보 확인, S3 액세스 키 만들기
3. Render 환경변수에 STORAGE_* 7개 넣기 → 재배포
4. 내 정보에서 이미지 올리고, 받은 주소가 브라우저에서 열리는지 확인
```

Spring으로 비유하면, `AmazonS3` 클라이언트로 버킷에 올리고 공개 URL을 DB에 저장하는 구조입니다. 이미지는 우리 API 서버를 거치지 않고 저장소(CDN)가 바로 내려줍니다.

## 꼭 알아 둘 것 (보안)

- **공개 버킷에는 공개해도 되는 파일만** 둡니다. 주소를 아는 사람은 누구나 열 수 있습니다. 프로필 이미지는 주소에 추측할 수 없는 무작위 key를 써서 다른 회원 사진을 훑어볼 수 없게 했습니다.
- 매무새 고객 문서처럼 **비공개 파일은 이 버킷에 넣지 않습니다.** 필요해지면 비공개 버킷 + 짧은 유효기간 주소(서명 URL)를 따로 만듭니다 ([향후 확장](future-extensions.md)).
- S3 액세스 키는 그 프로젝트의 **모든 버킷을 읽고 쓰고 지울 수 있는 키**입니다(Supabase의 RLS 권한 검사를 거치지 않음). 백엔드 `.env`·Render 환경변수에만 넣고, 프론트·채팅·커밋에는 절대 넣지 않습니다.
- 서버는 올린 이미지를 다시 그려 저장합니다. 사진 속 위치정보(EXIF)가 지워지고, 512px WEBP로 바뀝니다. 2MB 초과·이미지가 아닌 파일·깨진 파일은 저장 전에 거절합니다.

## 로컬 설정

### 1. 버킷 만들기

`supabase/config.toml`에 버킷이 이미 적혀 있습니다.

```toml
[storage.buckets.meerkit-public]
public = true
file_size_limit = "2MiB"
allowed_mime_types = ["image/webp"]
```

로컬 Supabase가 켜져 있었다면 한 번 껐다 켭니다. 켤 때 버킷이 만들어집니다.

```bash
npm run db:stop
npm run db:start
```

Studio(<http://127.0.0.1:54323>) → Storage에 `meerkit-public`이 보이면 됩니다.

이미 쓰던 로컬 DB가 있으면 껐다 켜도 버킷이 생기지 않을 수 있습니다(기존 데이터를 그대로 다시 씀). 그때는 아래 명령으로 `config.toml`의 버킷만 만듭니다. DB 데이터는 지워지지 않습니다.

```bash
npx supabase seed buckets --local
```

### 2. S3 키 확인하고 `.env`에 넣기

```bash
npx supabase status
```

출력에서 `S3 Access Key`, `S3 Secret Key`, `S3 Region` 세 값을 찾아 `backend/.env`에 넣습니다.

```dotenv
STORAGE_BACKEND=s3
STORAGE_BUCKET=meerkit-public
STORAGE_S3_ENDPOINT_URL=http://127.0.0.1:54321/storage/v1/s3
STORAGE_S3_REGION=local
STORAGE_S3_ACCESS_KEY_ID=<S3 Access Key>
STORAGE_S3_SECRET_ACCESS_KEY=<S3 Secret Key>
STORAGE_PUBLIC_BASE_URL=http://127.0.0.1:54321/storage/v1/object/public/meerkit-public
```

로컬 키는 내 컴퓨터의 Supabase에서만 쓰는 값이지만, 그래도 커밋하지 않습니다(`.env`는 이미 `.gitignore`에 있음).

### 3. 확인

1. 백엔드를 다시 띄웁니다: `cd backend && uv run uvicorn app.main:app --reload --port 8000`
2. 프론트에서 로그인 → 내 정보 → 이미지 변경으로 JPG·PNG·WEBP를 올립니다.
3. 동그란 사진이 바뀌면 성공입니다. Studio → Storage → `meerkit-public/avatars/`에 `.webp` 파일이 생깁니다.
4. 다시 올리면 이전 파일이 지워지고, 삭제하면 파일과 주소가 함께 지워집니다.

`STORAGE_BACKEND`를 비워 두면 서버는 그대로 뜨고, 이미지 올리기만 503 `STORAGE_NOT_CONFIGURED`로 응답합니다.

## 운영 설정 (Supabase + Render)

배포(S3 단계) 때 한 번 합니다. 10분쯤 걸립니다.

### 1. 버킷 만들기

1. [Supabase 대시보드](https://supabase.com/dashboard) → 운영 프로젝트 → 왼쪽 **Storage**
2. **New bucket**
   - Name: `meerkit-public`
   - **Public bucket: 켬** (누구나 주소로 읽기 가능, 쓰기는 키가 있는 서버만)
   - Restrict file upload size: 켜고 `2 MB`
   - Allowed MIME types: `image/webp` (서버가 항상 WEBP로 바꿔 올림)
3. Save

### 2. S3 접속 정보와 액세스 키

1. Storage 화면의 **Settings**(또는 S3 Configuration) 메뉴
2. **S3 protocol connection**이 켜져 있는지 확인하고, 아래 두 값을 적어 둡니다
   - Endpoint: `https://<프로젝트 ref>.storage.supabase.co/storage/v1/s3` 형태
   - Region: 프로젝트 리전 (예: `ap-northeast-2`)
3. **S3 Access Keys** → **New access key** → 설명에 `meerkit-backend-prod`
4. 나오는 **Access key ID**와 **Secret access key**를 바로 Render에 넣습니다. Secret은 이 화면에서 한 번만 보입니다.

공개 주소의 앞부분은 `https://<프로젝트 ref>.supabase.co/storage/v1/object/public/meerkit-public`입니다. 프로젝트 ref는 대시보드 주소(`/project/<ref>`)나 Project Settings → General에 있습니다.

### 3. Render 환경변수

Render → 백엔드 서비스 → **Environment**에 7개를 넣고 저장하면 재배포됩니다.

| 이름 | 값 |
| --- | --- |
| `STORAGE_BACKEND` | `s3` |
| `STORAGE_BUCKET` | `meerkit-public` |
| `STORAGE_S3_ENDPOINT_URL` | 2단계의 Endpoint |
| `STORAGE_S3_REGION` | 2단계의 Region |
| `STORAGE_S3_ACCESS_KEY_ID` | 2단계의 Access key ID |
| `STORAGE_S3_SECRET_ACCESS_KEY` | 2단계의 Secret access key |
| `STORAGE_PUBLIC_BASE_URL` | `https://<프로젝트 ref>.supabase.co/storage/v1/object/public/meerkit-public` |

운영(`APP_ENV=production`)에서 `STORAGE_BACKEND=memory`이거나 공개 주소가 localhost면 서버가 시작하지 않고 고칠 항목을 알려 줍니다.

### 4. 확인

1. 운영 사이트에 로그인 → 내 정보 → 이미지 변경
2. 사진이 바뀌는지 보고, 개발자 도구에서 이미지 주소가 `https://<ref>.supabase.co/storage/v1/object/public/meerkit-public/avatars/...webp`인지 확인
3. 그 주소를 새 탭(로그인 안 된 창)에서 열어 이미지가 보이면 끝

## 운영 중 할 일

| 상황 | 할 일 |
| --- | --- |
| 키가 새었거나 담당자가 바뀜 | 대시보드에서 새 액세스 키 발급 → Render 값 교체·재배포 → 예전 키 삭제 |
| 업로드가 503 `STORAGE_UNAVAILABLE` | Render 로그에서 `저장소 put_object 실패 ... error=` 뒤의 예외 이름 확인. 키 오타, 버킷 이름, 리전, Supabase 장애 순으로 확인 |
| 용량·전송량 | Supabase 대시보드 → Usage에서 Storage 용량과 전송량 확인 (무료 플랜은 한도가 있음) |
| 탈퇴 회원 사진 | 보관 기간이 지나 개인정보를 지울 때(`python -m app.users.purge`) 사진 파일도 함께 지워짐 |
| 백업 | Storage 파일은 DB 백업에 들어가지 않습니다. 프로필 이미지는 사용자가 다시 올릴 수 있어 따로 백업하지 않습니다 |

## 다른 업체로 옮길 때

| 업체 | `STORAGE_S3_ENDPOINT_URL` | `STORAGE_PUBLIC_BASE_URL` |
| --- | --- | --- |
| AWS S3 | `https://s3.<리전>.amazonaws.com` | `https://<버킷>.s3.<리전>.amazonaws.com` 또는 CloudFront 주소 |
| Cloudflare R2 | `https://<계정 ID>.r2.cloudflarestorage.com` | 버킷의 Public URL(r2.dev 또는 연결한 도메인) |

기존 파일은 업체 도구로 복사하고, `users.avatar_url`의 주소 앞부분을 새 공개 주소로 바꾸는 SQL을 한 번 실행합니다.

## 서비스(매무새 등)에서 쓰는 법

```python
from app.storage import get_storage

storage = get_storage()
storage.put("maemusae/exports/abc.xlsx", data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
url = storage.public_url("maemusae/exports/abc.xlsx")
storage.delete("maemusae/exports/abc.xlsx")
```

- key 앞에 서비스 이름을 붙여 폴더를 나눕니다 (`avatars/`는 킷이 씀).
- 공개 버킷이므로 공개해도 되는 파일만 넣습니다. 고객 문서는 넣지 않습니다.
- 테스트에서는 `storage` 픽스처(메모리 저장소)를 씁니다. `storage.objects`로 올라간 파일을 확인할 수 있습니다.
