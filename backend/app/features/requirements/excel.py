"""기능정의서를 Excel 파일로 만듭니다.

지금은 빈 통합 문서에 표를 그립니다. 고정 표준 템플릿(templates/feature_spec.xlsx)이
준비되면 그 파일을 열어 셀에 값만 채우도록 바꿉니다.
"""

from io import BytesIO

from openpyxl import Workbook

from app.features.requirements.schemas import FeatureSpecRead

HEADERS = [
    "기능 ID",
    "메뉴",
    "기능명",
    "설명",
    "우선순위",
    "완료 기준",
    "근거 요구사항",
]


def build_feature_spec_xlsx(spec: FeatureSpecRead) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "기능정의서"
    sheet.append([spec.title])
    sheet.append(HEADERS)
    for item in spec.items:
        sheet.append(
            [
                item.feature_id,
                item.menu,
                item.name,
                item.description,
                item.priority.value,
                "\n".join(item.acceptance_criteria),
                ", ".join(item.requirement_codes),
            ]
        )
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()
