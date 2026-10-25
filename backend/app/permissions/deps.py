from collections.abc import Callable

from fastapi import Depends

from app.auth.deps import get_current_user
from app.core.exceptions import ForbiddenError
from app.permissions import roles
from app.users.models import User


def require_roles(*codes: str) -> Callable[..., User]:
    """나열한 역할 중 하나라도 있어야 통과합니다. 예: Depends(require_roles(roles.MASTER))"""

    def checker(user: User = Depends(get_current_user)) -> User:
        if not any(user.has_role(code) for code in codes):
            raise ForbiddenError("FORBIDDEN", "권한이 없습니다.")
        return user

    return checker


require_admin = require_roles(roles.ADMIN_ROLE)
