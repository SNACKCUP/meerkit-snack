"""매무새: MeerKit 위에 만든 서브 서비스 (요구사항 정리 도우미).

킷의 공개 기능(권한 검사 app.core.principal, 회원 app.users, 공통코드 app.codes 등)만 가져다 쓰고,
킷은 이 폴더를 모릅니다. 테이블은 모두 mms_ 로 시작합니다.

    projects/      프로젝트·멤버 (프로젝트 안 관리자 ADMIN / 일반 MEMBER)
    access.py      "이 프로젝트를 볼 수 있나 / 멤버인가 / 관리자인가" 검사. 모든 매무새 API 가 씀
    errors.py      매무새 오류 코드
"""
