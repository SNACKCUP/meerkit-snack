# 향후 확장

10일 코스 범위에서는 제외했지만, MeerKit을 이어서 발전시킬 때 고려할 항목입니다.

## 서브 서비스 매무새 (요구사항 정리 도우미)

| 항목 | 현재 | 확장 방향 |
|---|---|---|
| 출력 템플릿 | 고정된 표준 Excel 템플릿 1종 | 고객이 쓰는 원본 Word/Excel 템플릿의 서식을 유지한 채 내용 채우기 |
| 입력 형식 | txt, docx, pdf | HWP 지원 (현재는 PDF로 변환 후 업로드 안내) |
| 확정 흐름 | 관리자 1명이 확정 | 여러 검토자, 변경 이력, 코멘트 |
| 출력 형식 | 웹 화면, Excel | Word, PDF, 이슈 트래커(Jira 등)로 내보내기 |
| 문서 이해 | 문서 전체를 한 번에 처리 | 긴 문서 분할 처리, 표·이미지 인식 |

## 스타터킷 공통 기반

| 항목 | 설명 |
|---|---|
| 앱 컨테이너화 | backend/frontend Dockerfile과 전체 서비스 Docker Compose |
| 배포 | 클라우드 배포 파이프라인 (CD), 환경별 설정 분리 (dev/staging/prod) |
| 인증 | 소셜 로그인, 2단계 인증, 리프레시 토큰 회전·서버 저장(기기별 로그아웃), IP 기준 요청 제한 |
| 권한 | 역할별 세부 권한: 지금은 역할 4종(MASTER/OWNER/VIEWER/WRITER)의 이름만 있고 관리자(MASTER) 검사만 한다. `permissions`, `role_permissions` 테이블을 추가하고 역할 대신 권한 코드(`REQUIREMENT_CONFIRM` 등)로 검사. 지금의 users/roles/user_roles는 그대로 둠 |
| 메일 | 실제 메일 업체 연결: 업체(AWS SES, Resend, SendGrid 등)를 정하면 `backend/app/mail/backends.py`에 API 백엔드를 추가(지금은 업체의 SMTP로도 연결 가능). 보내는 도메인의 SPF·DKIM·DMARC 등록, 발송 실패 재시도 큐, 반송·수신 거부 처리 |
| 약관 | 약관 본문 관리 화면, 새 버전 재동의 받기, 마케팅 수신 동의 철회 API |
| 비동기 작업 | 긴 LLM 작업을 백그라운드 큐(Celery, RQ 등)로 처리하고 진행 상태 표시 |
| LLM 운영 | 응답 캐싱, 프롬프트 버전 관리, 트레이싱 |
| 사용자 AI 키·사용량 | 사용자가 AI 공급자와 API 키를 등록(개인/공용 구분, 암호화 저장), 호출마다 토큰 사용량·비용 기록(`usage_logs`), 잔여량 10% 알림. OpenAI·Claude는 잔액 API가 없어 "충전 금액 - 사용 금액" 추정 + 잔액 부족 오류 감지, OpenRouter는 실제 잔액 조회 |
| 설치 도구 | `npm run setup`(한 번에 환경 구성), `create-meerkit`(새 프로젝트 생성), 사용 설명서 사이트 |
| 비공개 파일 저장 | 공개 버킷(`app.storage`, [설정](storage-setup.md))은 만들었음. 매무새 고객 문서처럼 비공개 파일은 비공개 버킷 + 짧은 유효기간 주소(서명 URL)로 추가 |
| 관측성 | 구조화 로그 수집, 에러 추적(Sentry 등), 메트릭 |
| 테스트 | 프론트엔드 단위 테스트, E2E 테스트 (Playwright) |
