// MeerKit 공개 API. 킷 밖(app/, 서비스 화면)에서는 여기서 export 한 것만 import 하세요.
export { meerkitConfig } from "./config";
export type { RoleCode, User } from "./types";

export { api, errorMessage } from "./api/client";

export { MeerkitProvider } from "./providers/MeerkitProvider";
export { WelcomePage } from "./welcome/WelcomePage";
export { KitHeader } from "./components/KitHeader";

export { useAuth, usePermission } from "./auth/hooks";
export { useMe } from "./auth/queries";
export { useLogin, useLogout, useSignup } from "./auth/mutations";
export { useAuthDialog } from "./auth/dialog-store";
export { RequireAuth } from "./auth/guards/RequireAuth";
export { RequireRole } from "./auth/guards/RequireRole";
export { UserMenu } from "./auth/components/UserMenu";
export { MyInfo } from "./auth/components/MyInfo";

export { MemberTable } from "./admin/components/MemberTable";
