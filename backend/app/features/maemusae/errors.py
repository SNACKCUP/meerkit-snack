"""매무새 오류. 킷의 AppError 계열을 상속해서 전역 핸들러가 {"detail","code","request_id"} 로 응답합니다."""

from app.core.exceptions import (
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
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


class DocumentNotFoundError(NotFoundError):
    def __init__(self):
        super().__init__("DOCUMENT_NOT_FOUND", "문서를 찾을 수 없습니다.")


class DocumentBusyError(ConflictError):
    def __init__(self):
        super().__init__("DOCUMENT_BUSY", "AI 분석이나 확정이 진행 중이라 지금은 파일을 바꿀 수 없습니다. 끝난 뒤 다시 시도하세요.")


class SourceNotFoundError(NotFoundError):
    def __init__(self):
        super().__init__("SOURCE_NOT_FOUND", "올린 파일을 찾을 수 없습니다.")


class SourceInputRequiredError(BadRequestError):
    def __init__(self):
        super().__init__("SOURCE_INPUT_REQUIRED", "파일 하나 또는 직접 쓴 글 중 하나만 보내세요.")


class FileTooLargeError(AppError):
    status_code = 413

    def __init__(self, max_mb: int):
        super().__init__("FILE_TOO_LARGE", f"파일은 {max_mb}MB 이하만 올릴 수 있습니다.")


class UnsupportedFileTypeError(AppError):
    status_code = 415

    def __init__(self):
        super().__init__(
            "UNSUPPORTED_FILE_TYPE", "PDF, Word(docx), PowerPoint(pptx), Excel(xlsx), txt, md 파일만 올릴 수 있습니다."
        )


class DocumentParseFailedError(ValidationError):
    def __init__(self):
        super().__init__(
            "DOCUMENT_PARSE_FAILED", "파일에서 글자를 읽을 수 없어요. 파일이 깨졌거나 스캔한 이미지인지 확인하세요."
        )


class DocumentTooLongError(ValidationError):
    def __init__(self, max_chars: int):
        super().__init__("DOCUMENT_TOO_LONG", f"파일 하나의 글자 수는 {max_chars:,}자까지입니다. 파일을 나눠서 올리세요.")


class SourceDuplicateError(ConflictError):
    def __init__(self):
        super().__init__("SOURCE_DUPLICATE", "같은 파일이 이미 올라가 있습니다.")


class SourceLimitError(ConflictError):
    def __init__(self, limit: int):
        super().__init__("SOURCE_LIMIT_REACHED", f"문서 하나에는 파일을 {limit}개까지 올릴 수 있습니다.")


class SourceDeleteForbiddenError(ForbiddenError):
    def __init__(self):
        super().__init__("SOURCE_DELETE_FORBIDDEN", "올린 사람이나 프로젝트 관리자만 지울 수 있습니다.")
