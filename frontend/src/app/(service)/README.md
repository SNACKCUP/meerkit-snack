# 서비스 화면 자리

내 서비스 화면을 이 폴더 아래에 만듭니다. `(service)`는 URL에 나타나지 않습니다.

```text
app/(service)/requirements/page.tsx   →  /requirements
```

화면에서는 킷의 공개 API만 사용합니다.

```tsx
import { RequireAuth, api, useAuth } from "@/meerkit";
```
