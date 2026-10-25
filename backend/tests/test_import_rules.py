import re
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1] / "app"
KIT_PACKAGES = ["core", "auth", "users", "permissions", "llm", "mail"]
FEATURE_IMPORT = re.compile(r"^\s*(from|import)\s+app\.features\b", re.MULTILINE)


def test_kit_never_imports_features():
    """공통 기반(core/auth/users/permissions/llm/mail)은 features 를 import 하지 않습니다. 그래야 기능을 지워도 키트가 동작합니다."""
    offenders = [
        str(path.relative_to(APP_DIR))
        for package in KIT_PACKAGES
        for path in (APP_DIR / package).rglob("*.py")
        if FEATURE_IMPORT.search(path.read_text(encoding="utf-8"))
    ]

    assert offenders == []
