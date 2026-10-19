# 내 보안 Agent 시작 틀 0.2.11

이 보안 Agent는 회사 직원이 자기 로그인 상태, 업무 앱 접속 결과, 최근 접속 기록과 보안 경보를 보는 보안 앱입니다. 13단계부터 22단계까지 이 프로젝트 하나로 화면을 채워 가며 완성합니다. 처음이라면 docs/GETTING_STARTED_STUDENT.md부터 읽습니다. 무엇을 왜 만드는지와 단계별 순서가 그 문서에 있습니다.

이 시작 틀을 받은 것만으로 단계를 통과하지 않습니다. 단계마다 docs/STUDENT_PROMPTS.md의 안내를 수업용 AI에 붙여 넣어 student/extension.mjs를 고치고, 화면에서 확인하고, 커밋한 뒤 ALEPH에 제출합니다. 제출하면 서버가 그 커밋의 코드를 받아 AI가 단계 과제 기준으로 읽고 판정합니다. 코드를 실행해서 판정하지 않습니다.

## 켜기

검수 환경은 Node.js 24.19.0이며 외부 npm 의존성이 없습니다. 이 폴더의 PowerShell에서 아래를 실행하고 PC 브라우저로 http://127.0.0.1:5189 를 엽니다. 자세한 켜기·끄기·다시 켜기는 docs/STUDENT_LAUNCH_GUIDE.md에 있습니다.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

npm start도 같은 서버를 켭니다. 기본 실행은 실제 회사 시스템(기존 엔진)에 연결되지 않은 상태입니다. npm run demo는 예제 자료로 화면을 보여 줄 뿐이며 실제 연결이나 성취가 아닙니다. npm run check는 student/extension.mjs의 문법만 확인합니다.

## 지킬 것

- 기존 1~3차 프로젝트와 학생 파일은 지우거나 덮어쓰지 않습니다. 새 폴더에서 시작하거나, 이미 하던 프로젝트를 이어 씁니다.
- AI 열쇠·비밀번호·토큰을 코드, 커밋, 캡처, 도움정보에 넣지 않습니다. 주소나 열쇠를 직접 입력하는 칸도 만들지 않습니다.
- .env.example에는 비밀 없는 설정만 있습니다.

## 더 읽을 곳

- 단계별 안내와 AI에 붙여 넣을 문장: docs/STUDENT_PROMPTS.md
- 단계별 확인 항목: docs/CURRICULUM.json, docs/IMPLEMENTATION_CONTRACT.md
- 오류 코드별 해결: docs/CONNECTION_TROUBLESHOOT.md
- 시작 틀 업데이트(내 파일 보존): docs/STARTER_UPDATE.md
- 실제 회사 시스템(SDP)·앱 안 AI 연결은 담당자가 따로 안내할 때만 씁니다: docs/SDP_HOST_CONNECTION.md, docs/AI_SETUP_GUIDE.md. 이 연결은 앱을 처음 켜고 13~16단계 화면을 만들거나 공식 AI 코드 판정을 받기 위한 전제 조건은 아닙니다. 다만 17단계 이후의 실제 연결과 새 환경 재현은 해당 단계의 기준에 따라 따로 확인합니다.

## 케셰브 · 13~14단계 구현 기록

- 13단계: 사용자·현재 기기·현재 세션 및 기기·세션 목록을 표시합니다. 각 자료의 loading/ok/error와 연결 모드를 구분하고, 상태 설명 옆에 원래 코드를 표시합니다. 사용자 보고로 공식 통과를 확인했습니다.
- 14단계: 학생 함수 `renderDecision({ status, mode, data?, error?, appId })`를 구현했습니다. 제공 UI의 `studentData('decision')`에서 요청 상태와 선택 앱 ID를 받고, 응답 `data`의 appId·decision·reason·checkedAt을 표시합니다.
- 제공 서버·public/app.js·인증 설정과 13단계 renderIdentity, 다른 학생 함수는 이번 변경에서 수정하지 않았습니다.

### 14단계 표시

| 입력 | 학생 표시 |
|---|---|
| idle | 앱을 골라 접속을 요청하라는 안내 |
| loading | 선택 앱 ID와 판정 확인 중 안내 |
| ok / allow | 접근 허용(allow), 판정 이유·시각 |
| ok / deny | 접근 거부(deny), 판정 이유·시각 |
| ok / challenge | 추가 인증 또는 확인 필요(challenge), 판정 이유·시각, 이 앱이 확인 절차를 대신 수행하지 않는다는 안내 |
| ok / unknown 또는 알 수 없는 decision | 판정 확인 불가(unknown), 판정 이유·시각. 허용으로 표시하지 않음 |
| error | 요청 실패와 error.message. 접근 거부 판정과 구분 |

각 상태에서 demo는 예제 자료, disconnected는 연결 없음, unknown은 확인 불가로 표시합니다. 전달받은 문자열은 createElement와 textContent로 표시하며 HTML로 해석하지 않습니다. 호출마다 새 DOM을 반환하므로 요청 중·실패 상태에 이전 판정 이유가 남지 않습니다.

allow는 정책상 허용이며 실제 앱 접속 성공을 보장하지 않습니다. 전체 업무 앱 권한을 조회하거나 추가 인증을 대신 수행하는 기능은 아닙니다.

### 실행 및 직접 확인

저장소 루트가 아닌 `keshev/on-client` 폴더의 PowerShell에서 실행합니다.

```powershell
npm start
```

브라우저에서 http://127.0.0.1:5189 를 엽니다. 기본 실행은 실제 엔진 연결이 없으므로 실패·연결 없음이 표시될 수 있습니다. 예제 자료만 확인하려면 서버를 종료한 뒤 같은 폴더에서 `npm run demo`를 실행합니다. 예제 결과는 실제 계정의 접속 결과가 아닙니다.

첫 확인: 업무 앱 메뉴에서 앱 하나를 선택하고 접근 요청을 누른 뒤, 학생 구현 영역에 해당 앱 ID·실제 반환된 판정·이유·시각이 표시되는지 확인합니다. allow가 반환되면 정책상 허용으로, deny가 반환되면 접근 거부로 표시되어야 합니다. 요청 실패는 deny 판정과 달라야 합니다.

이후 확인: 키보드로 앱을 선택하고 접근 요청을 실행해 결과가 갱신되는지 확인합니다. 현재 계정에서 다른 판정이 나오지 않는다는 이유로 정책이나 인증 정보를 변경하지 않습니다.

### 검증 기록과 남은 확인

- 코드 검토: 제공 UI의 입력 전달·학생 DOM 교체 연결 확인. renderIdentity와 renderEvents 이후 학생 함수 원문 보존 확인.
- 로컬 실행: Node.js 24.19.0에서 수정 파일의 문법 검사 통과.
- 모의 DOM 점검: 22개 점검 통과. 네 판정·알 수 없는 값, 요청 상태별 모드 안내, 실패와 deny 구분, 이전 이유 미표시, HTML 형태 문자열의 텍스트 처리, 호출별 새 DOM 반환을 확인했습니다.
- 미확인: 실제 브라우저의 화면·키보드 조작, 실제 계정·엔진의 반환 결과, 실제 서버 장애 상황.
- 14단계 공식 판정은 아직 확인하지 않았습니다. 위 점검은 공식 통과 기록이 아닙니다. 제출은 사용자가 직접 진행합니다.
