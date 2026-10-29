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


class InvitationInvalidError(NotFoundError):
    # 없는·만료된·취소된·이미 쓴 토큰을 구분하지 않고 같은 응답을 줍니다 (토큰 상태를 알려 주지 않음)
    def __init__(self):
        super().__init__("INVITATION_INVALID", "초대 링크가 만료되었거나 더 이상 쓸 수 없습니다. 관리자에게 다시 초대를 요청하세요.")


class InvitationNotFoundError(NotFoundError):
    def __init__(self):
        super().__init__("INVITATION_NOT_FOUND", "대기 중인 초대를 찾을 수 없습니다.")


class AlreadyMemberError(ConflictError):
    def __init__(self):
        super().__init__("ALREADY_MEMBER", "이미 이 프로젝트의 멤버입니다.")


class InvitationEmailMismatchError(ForbiddenError):
    def __init__(self):
        super().__init__(
            "INVITATION_EMAIL_MISMATCH", "초대받은 이메일과 로그인한 계정의 이메일이 다릅니다. 초대받은 이메일의 계정으로 로그인하세요."
        )
