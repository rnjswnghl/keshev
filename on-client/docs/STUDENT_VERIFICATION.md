# 21단계 문서·원문 대조 및 재검사 기록

검사일: 2026-10-26. 앱 소스 기준 커밋: `b323df9e8426492c4e072cc4920adea7e52f19f1`. 현재 수정은 README·학생 문서뿐이며 이 기준의 실행 코드를 바꾸지 않습니다. 실제 검사는 Linux에서 수행했으며 Windows PowerShell이나 원격 운영 시스템에서 실행한 것으로 기록하지 않습니다. 아래 결과는 공식 과제 판정이 아닙니다.

## 판정 항목별 확인 위치

| 공식 항목 | 문서 근거 | 대조한 원문·확인 범위 |
|---|---|---|
| documentation_scope | README의 현재 학생 구현·실행 안내, STUDENT_RUNBOOK 1·2·5절 | on-client/package.json의 버전·스크립트, 학생 함수 8개, 기본 연결·예제 한계 |
| run_instructions_match_source | RUNBOOK 2·3·9절 | start=node src/server.mjs, demo에 --demo, check=node --check student/extension.mjs. 원문 CLI의 --commit·--output과 Git 최상위 조건 대조 |
| architecture_matches_source | RUNBOOK 4절 Mermaid 및 설명, 아래 API 표 | public/app.js의 요청·studentData·renderStudent, src/server.mjs의 경로 연결, src/engine·ai·actions·vulnerabilities와 어댑터 |
| provided_student_boundary | RUNBOOK 2·5절 | 제공 서버·UI와 학생 DOM 구현 분리. 기존 자료실 공개 키 제거는 승인받은 별도 변경으로 10절에 기재 |
| failure_guide_matches_source | RUNBOOK 7절 | ENGINE_NOT_CONNECTED, NATIVE_HOST_DISABLED, AI 오류, 조치 unknown, OSV 미조회, loadDiagnostics와 trackError의 학생 재렌더링 연결 대조 |
| support_scope_honest | RUNBOOK 1·8·10절, 아래 실행 기록 | Linux HTTP·모의 검사와 실제 PC·원격 연결 미확인 구분. 실제 조치 연결 미완료(UNV) 유지 |

제공 문서는 덮어쓰지 않았습니다. 최상위 README·1~12단계 기록·학생 함수·제공 서버·인증 설정·의존성·lock은 이번 문서 재검사에서 변경하지 않습니다. `.env`나 키를 담은 설정 파일을 새로 생성하지 않습니다.

## 실제 요청 경로와 책임

아래 경로는 브라우저와 **로컬 앱 서버** 사이의 경로입니다. 원격 게이트나 SDP에 브라우저가 직접 요청한다는 뜻이 아닙니다. POST 경로는 코드를 읽어 확인했으며 이번 재검사에서는 호출하지 않았습니다.

| 경로·메서드 | 제공 서버·화면의 책임 | 학생 표시 |
|---|---|---|
| GET /api/me, /api/devices, /api/sessions | 본인 계정·기기·검증된 현재 연결 조회 | renderIdentity·renderStatus |
| GET /api/apps, POST /api/access | 앱 목록·선택 앱 정책 판정 | renderDecision |
| GET /api/events | 본인 최근 기록·저장된 XDR 경보 조회 | renderEvents |
| GET /api/diagnostics | 비밀 없는 도움정보. loadDiagnostics의 trackError가 학생 상태를 갱신 | renderStatus의 여섯 허용 필드만 표시·복사 |
| POST /api/ai/check, /api/ai/explain | 앱 권한과 원격 모델 점검·사건 설명, 입력·응답 검증·취소 | renderAiConnection·renderExplanation |
| POST /api/actions/prepare, /api/actions/execute, /api/actions/result | 현재 사건·사람 확인·전송·원천 결과 재조회 | renderAction. 학생 함수에 버튼·POST·티켓 저장 없음 |
| GET /api/vulnerabilities | 승인된 공개 패키지의 lock·설치 대조 및 OSV 요청 | renderVulnerabilities |

학생 영역의 도움정보 복사는 제공 UI의 전체 도움정보 복사와 다릅니다. 학생 함수는 requestId·component·version·checkedAt·engine.mode·engine.code만 새 객체로 골라 표시·복사합니다. 브라우저 복사 권한과 실제 상호작용은 미확인입니다.

## 커밋된 파일만 사용한 실제 로컬 검사

Git 기준 커밋의 파일을 프로젝트 밖의 빈 임시 폴더로 분리했습니다. 미커밋 파일·사용자 개인 설정·기존 node_modules를 복사하지 않았고 설치 명령도 실행하지 않았습니다. Node.js v24.22.1에서 `npm run check`가 통과했습니다. 기본·예제 각각 `node src/server.mjs` / `node src/server.mjs --demo`를 시작했습니다. 기존 실행 작업과 충돌하지 않도록 검사 프로세스에만 ON_PORT를 임시 지정하고 127.0.0.1의 빈 포트를 사용했습니다. 문서의 기본값 5189를 실제 사용했다고 주장하지 않습니다.

| GET 요청 | 기본 실행 | 예제 실행 | 해석 |
|---|---|---|---|
| / | 200, 세 메뉴 문자열 포함 | 200, 세 메뉴 문자열 포함 | 서버와 HTML 응답 확인. 브라우저 JS 실행 검사가 아님 |
| /student/extension.mjs | 200 | 200 | 학생 모듈 제공 경로 확인 |
| /api/me | 503, disconnected, ENGINE_NOT_CONNECTED | 200, demo | 기본 미연결과 예제 자료 구분 |
| /api/events | 503, disconnected, ENGINE_NOT_CONNECTED | 200, demo | 과거 기록을 성공으로 보존하는 검사가 아니라 현재 응답 확인 |
| /api/diagnostics | 200, disconnected | 200, demo | HTTP 200이어도 실제 엔진 연결 성공은 아님 |
| /api/vulnerabilities | 200, not_configured | 200, not_configured | 대상 설정·공개 승인 목록 없이 외부 조회하지 않은 상태. 취약점 없음 아님 |

검사 프로세스 둘은 각각 종료·회수했습니다. 이 과정에서 계정 승인·유료 AI·실제 보안 집행·외부 OSV 요청·Vercel 배포·단계 제출을 하지 않았습니다. 원격 설정을 넘기지 않은 기본 구성으로만 실행했습니다.

## package·lock·설정 견본 정합성

| 범위 | 원문에서 확인한 값 | 실행 문서에서의 처리 |
|---|---|---|
| on-client/package.json | 앱 0.2.11, Node 24.19.0, 외부 dependencies 없음 | 기본 로컬 실행에 최상위 npm ci를 요구하지 않음 |
| tools/start-alekov.ps1 | Node 22~24 허용·24.19.0 권장, ON_PORT 지정, 비밀 환경변수 제외 | Windows 실행 미확인, 다른 포트 예시는 -Port 5190 |
| 최상위 package.json 및 package-lock.json | lockfileVersion 3, @supabase/supabase-js 2.117.2, jose 6.2.12가 양쪽 일치 | 기존 자료실의 의존성. 로컬 앱 실행 절차와 분리 |
| on-client/.env.example | 포트·어댑터·AI 모델·조회 대상·공개 승인 목록의 견본 | 실제 값 없음. start가 자동으로 읽지 않음을 안내 |
| api/auth.js | 기존 자료실의 공개 키는 SUPABASE_PUBLISHABLE_KEY 환경변수로만 수신 | Vercel 설정 확인은 필요하지만 실제 설정·로그인은 미확인. 로컬 앱과 구분 |

## 공식 원문 전달 도구 실제 검사

첨부 ZIP의 원본 도구를 프로젝트 밖에 풀어 사용했습니다. Git 최상위에서 선택한 기준 커밋과 프로젝트 밖의 새 JSON 경로를 명시해 CLI를 실행했습니다. JSON은 570,406바이트로 생성됐습니다. 이 크기는 해당 기준 커밋의 **원문 전달 파일 크기**이며 AI 검토 코드 크기나 검토 한도와 같은 지표가 아닙니다.

JSON의 commit이 선택 커밋과 같은지 확인했습니다. 포함된 압축 원문에서 on-client/README.md, docs/STUDENT_RUNBOOK.md, package.json, .env.example, student/extension.mjs를 꺼내 기준 커밋의 Git blob과 바이트 단위로 대조했습니다(각 경로는 on-client 기준). 실제 `.env` 파일이 포함되지 않은 것도 확인했습니다. 도구의 원문 포함 규칙·내용을 수정하거나 일부 코드를 숨겨 묶지 않았고 업로드하지 않았습니다. 생성한 검사 JSON은 저장소 밖에 두며 커밋하지 않습니다.

이후 새 커밋을 제출하려면 **그 커밋으로 원문을 다시 생성**해야 합니다. 기준 커밋으로 만든 검사 JSON을 다른 새 커밋의 제출에 재사용하지 않습니다. 제출 대기가 길다는 이유만으로 실패나 비밀 탐지로 판단하지 않으며, 같은 제출은 과제 화면의 「상태 다시 확인」으로 확인합니다.

## 확인하지 않은 것

Windows 새 PowerShell 실행, PC 브라우저의 실제 탭·키보드·취소·클립보드 조작, 실제 계정·SDP·AI 설명·OSV 조회·조치 효과, Vercel의 개인 환경변수 설정, 공식 21단계 통과는 미확인입니다. 원문 필터가 사용하는 전체 규칙과 지연 원인도 알 수 없습니다. 공개 키 리터럴 제거와 제한된 비밀값 패턴 검사는 통과했지만 비밀 부재·필터 통과를 인증한 것은 아닙니다. 확인을 위해 테스트 인증 문자열을 난독화하거나 이전 기능·필요한 소스를 제거하지 않습니다.
