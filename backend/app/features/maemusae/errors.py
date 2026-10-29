"""매무새 오류. 킷의 AppError 계열을 상속해서 전역 핸들러가 {"detail","code","request_id"} 로 응답합니다."""

from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
)


class ProjectNotFoundError(NotFoundError):
    # 멤버가 아닌 사람에게는 프로젝트가 있는지조차 알리지 않으려고 403 대신 이 404 를 씁니다
    def __init__(self):
        super().__init__("PROJECT_NOT_FOUND", "프로젝트를 찾을 수 없습니다.")


class ProjectAdminRequiredError(ForbiddenError):
    def __init__(self):
        super().__init__("PROJECT_ADMIN_REQUIRED", "프로젝트 관리자만 할 수 있습니다.")


class MemberNotFoundError(NotFoundError):
    def __init__(self):
        super().__init__("PROJECT_MEMBER_NOT_FOUND", "프로젝트 멤버를 찾을 수 없습니다.")


class LastProjectAdminError(ConflictError):
    def __init__(self):
        super().__init__(
            "LAST_PROJECT_ADMIN", "프로젝트에는 관리자가 한 명 이상 있어야 합니다. 다른 멤버를 먼저 관리자로 지정하세요."
        )


class InvalidPeriodError(BadRequestError):
    def __init__(self):
        super().__init__("INVALID_PERIOD", "종료일은 시작일과 같거나 뒤여야 합니다.")
