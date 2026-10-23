// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  // 제공 화면과 같은 안전한 오류 문구만 사용하며 원문 오류는 노출하지 않습니다.
  const AI_MESSAGES = Object.freeze({
    ON_AI_TRANSPORT_PENDING: 'AI 연결 모듈 준비 중입니다. 담당자에게 확인하세요.',
    WB_CLCO_NETWORK_ERROR: '네트워크 연결 실패입니다. 잠시 뒤 직접 다시 점검하세요.',
    WB_CLCO_SERVER_UNAVAILABLE: 'AI 서버가 응답하지 않습니다. 잠시 뒤 직접 다시 점검하세요.',
    ON_AI_PROVISIONING_PENDING: '학생 앱 이용 권한의 발급·연결을 준비 중입니다. 담당자에게 확인하세요.',
    WB_CLCO_AUTH_REQUIRED: '앱 전용 열쇠의 인증을 확인하세요. Workbench 열쇠를 복사하지 마세요.',
    WB_CLCO_ACCESS_BLOCKED: '학생 앱의 이용 권한을 확인하세요.',
    WB_CLCO_COHORT_BUDGET_EXHAUSTED: '반의 AI 사용량이 소진됐습니다. 담당자에게 확인하세요.',
    WB_CLCO_RATE_LIMITED: 'AI 요청이 잠시 제한됐습니다. 잠시 후 직접 다시 요청하세요.',
    WB_CLCO_LIMIT_REACHED: 'AI 이용 한도에 도달했습니다. 담당자에게 확인하세요.',
    WB_CLCO_SESSION_CLOSED: '현재 AI 이용 시간이 아닙니다. 이용 시간을 확인하세요.',
    WB_CLCO_TIMEOUT: 'AI 응답 시간이 초과됐습니다. 필요하면 직접 다시 요청하세요.',
    REQUEST_TIMEOUT: '서버의 AI 응답 시간이 초과됐습니다. 필요하면 직접 다시 요청하세요.',
    ENGINE_TIMEOUT: '서버의 확인 시간이 초과됐습니다. 필요하면 직접 다시 요청하세요.',
    TIMEOUT: 'AI 응답 시간이 초과됐습니다. 필요하면 직접 다시 요청하세요.',
    WB_CLCO_CANCELLED: 'AI 요청을 취소했습니다. 이전 응답은 현재 결과가 아닙니다.',
    CANCELLED: 'AI 요청을 취소했습니다. 이전 응답은 현재 결과가 아닙니다.',
    REQUEST_CANCELLED: 'AI 요청을 취소했습니다. 이전 응답은 현재 결과가 아닙니다.',
    MODEL_NOT_CONFIGURED: '서버에 사용할 AI 모델을 설정하세요.',
    ON_AI_AUTHORIZATION_CHANGED: 'AI 이용 권한 내용이 점검 도중 바뀌었습니다. 다시 점검하기 전에 담당자에게 현재 권한을 확인하세요.',
    ON_AI_MODEL_LIST_EMPTY: '현재 앱 권한으로 쓸 수 있는 AI 모델이 없습니다. 담당자에게 모델 허용 설정을 확인하세요.',
    SUBJECT_SCOPE_UNVERIFIED: '현재 로그인과 사건·프로젝트의 연결을 확인할 수 없습니다.',
    ON_AI_INVALID_INPUT: '설명에 필요한 사건 근거·규칙을 확인할 수 없습니다.',
    ON_AI_INVALID_OUTPUT: 'AI 설명의 근거·조치·응답 형식을 확인할 수 없습니다.',
    AI_REQUEST_UNVERIFIED: 'AI 연결 또는 응답을 확인할 수 없습니다. 기존 기록을 확인하세요.',
  });
  const aiError = (error) => {
    const code = Object.hasOwn(AI_MESSAGES, error?.code) ? error.code : 'AI_REQUEST_UNVERIFIED';
    return `${code}: ${AI_MESSAGES[code]}`;
  };
  const paragraph = (root, text) => {
    const node = document.createElement('p');
    node.textContent = text;
    root.append(node);
  };
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');
      root.className = 'student-identity';

      const element = (tag, text, className) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = String(text);
        return node;
      };
      const group = (title) => {
        const node = document.createElement('section');
        node.append(element('h3', title));
        return node;
      };
      const modeNotice = (resource) => {
        const mode = resource?.mode ?? 'unknown';
        const labels = {
          demo: '예제 자료',
          disconnected: '연결 없음',
          unknown: '확인 불가',
        };
        if (Object.hasOwn(labels, mode)) return element('p', `연결 모드: ${labels[mode]}`, 'student-identity-mode');
        if (mode !== 'connected') return element('p', '연결 모드: 확인 불가', 'student-identity-mode');
        return null;
      };
      const stateNotice = (resource) => {
        if (resource?.status === 'loading') return element('p', '불러오는 중', 'student-identity-state');
        if (resource?.status === 'error') {
          const code = resource.error?.code;
          const prefix = code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED' ? '확인 불가' : '연결 실패';
          const message = typeof resource.error?.message === 'string' && resource.error.message ? `: ${resource.error.message}` : '';
          return element('p', `${prefix}${message}`, 'student-identity-state');
        }
        if (resource?.status !== 'ok') return element('p', '확인 불가', 'student-identity-state');
        return null;
      };
      const value = (input) => typeof input === 'string' && input.length > 0 ? input : '확인 불가';
      const valueRow = (list, label, text) => {
        list.append(element('dt', label), element('dd', text));
      };
      const deviceStatus = (status) => ({
        compliant: '보안 기준 충족(compliant)',
        noncompliant: '보안 기준 미충족(noncompliant)',
        unknown: '확인 불가(unknown)',
      })[status] ?? '확인 불가';
      const sessionStatus = (status) => ({
        active: '활성(active)',
        expired: '만료(expired)',
        revoked: '철회됨(revoked)',
        unknown: '확인 불가(unknown)',
      })[status] ?? '확인 불가';

      const current = group('계정·현재 기기·현재 세션');
      const currentMode = modeNotice(me);
      if (currentMode) current.append(currentMode);
      const currentState = stateNotice(me);
      if (currentState) current.append(currentState);
      if (me?.status === 'ok') {
        const user = group('계정');
        const userValues = document.createElement('dl');
        valueRow(userValues, '사용자 이름', value(me.data?.user?.label));
        valueRow(userValues, '사용자 ID', value(me.data?.user?.id));
        user.append(userValues);

        const currentDevice = group('현재 기기');
        const deviceValues = document.createElement('dl');
        valueRow(deviceValues, '기기 이름', value(me.data?.device?.label));
        valueRow(deviceValues, '기기 ID', value(me.data?.device?.id));
        valueRow(deviceValues, '기기 보안 상태', deviceStatus(me.data?.device?.status));
        currentDevice.append(deviceValues);

        const currentSession = group('현재 로그인 세션');
        const sessionValues = document.createElement('dl');
        valueRow(sessionValues, '세션 ID', value(me.data?.session?.id));
        valueRow(sessionValues, '세션 상태', sessionStatus(me.data?.session?.status));
        currentSession.append(sessionValues);

        current.append(user, currentDevice, currentSession);
      }
      root.append(current);

      const deviceList = group('기기 목록');
      const deviceMode = modeNotice(devices);
      if (deviceMode) deviceList.append(deviceMode);
      const deviceState = stateNotice(devices);
      if (deviceState) deviceList.append(deviceState);
      if (devices?.status === 'ok') {
        if (Array.isArray(devices.data) && devices.data.length > 0) {
          const list = document.createElement('ul');
          for (const device of devices.data) {
            const item = document.createElement('li');
            item.append(
              element('span', `기기 이름: ${value(device?.label)}`),
              element('span', ` · 기기 ID: ${value(device?.id)}`),
              element('span', ` · 보안 상태: ${deviceStatus(device?.status)}`),
            );
            list.append(item);
          }
          deviceList.append(list);
        } else {
          deviceList.append(element('p', '표시할 기기가 없습니다.'));
        }
      }
      root.append(deviceList);

      const sessionList = group('로그인 세션 목록');
      const sessionsMode = modeNotice(sessions);
      if (sessionsMode) sessionList.append(sessionsMode);
      const sessionsState = stateNotice(sessions);
      if (sessionsState) sessionList.append(sessionsState);
      if (sessions?.status === 'ok') {
        if (Array.isArray(sessions.data) && sessions.data.length > 0) {
          const list = document.createElement('ul');
          for (const session of sessions.data) {
            const item = document.createElement('li');
            item.append(
              element('span', `세션 ID: ${value(session?.id)}`),
              element('span', ` · 세션 상태: ${sessionStatus(session?.status)}`),
            );
            list.append(item);
          }
          sessionList.append(list);
        } else {
          sessionList.append(element('p', '표시할 세션이 없습니다.'));
        }
      }
      root.append(sessionList);
      return root;
    },
    renderDecision({ status = 'idle', mode = 'unknown', data, error, appId } = {}) {
      const root = document.createElement('section');
      root.className = 'student-decision';
      const element = (tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        return node;
      };
      const value = (input) => typeof input === 'string' && input.length > 0 ? input : '확인 불가';
      root.append(element('h3', '업무 앱 접속 판정'));
      const modes = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      root.append(element('p', '연결 모드: ' + (Object.hasOwn(modes, mode) ? modes[mode] : modes.unknown)));

      if (status === 'idle') {
        root.append(element('p', '앱을 골라 접속을 요청하세요.'));
        return root;
      }
      root.append(element('p', '업무 앱 ID: ' + value(status === 'ok' ? data?.appId ?? appId : appId)));
      if (status === 'loading') {
        root.append(element('p', '판정 확인 중'));
        return root;
      }
      if (status === 'error') {
        root.append(
          element('p', '요청 실패: ' + value(error?.message)),
          element('p', '요청 실패는 접근 거부(deny) 판정이 아닙니다. 접근 허용 여부를 확인할 수 없습니다.'),
        );
        return root;
      }
      if (status !== 'ok') {
        root.append(element('p', '판정 확인 불가(unknown): 요청 상태를 확인할 수 없습니다.'));
        return root;
      }

      const decisions = {
        allow: '접근 허용(allow)',
        deny: '접근 거부(deny)',
        challenge: '추가 인증 또는 확인 필요(challenge)',
        unknown: '판정 확인 불가(unknown)',
      };
      const decision = typeof data?.decision === 'string' && Object.hasOwn(decisions, data.decision) ? data.decision : 'unknown';
      root.append(element('p', decisions[decision]));
      const details = document.createElement('dl');
      details.append(
        element('dt', '판정 이유'), element('dd', value(data?.reason)),
        element('dt', '판정 시각'), element('dd', value(data?.checkedAt)),
      );
      root.append(details);
      if (decision === 'allow') root.append(element('p', '정책상 접근 허용이며 실제 앱 접속 성공을 보장하지 않습니다.'));
      if (decision === 'challenge') root.append(element('p', '추가 인증 또는 확인이 필요합니다. 이 앱은 확인 절차를 대신 수행하지 않습니다.'));
      if (decision === 'unknown') root.append(element('p', '접근 허용 여부를 확인할 수 없습니다.'));
      return root;
    },
    renderEvents({ status, mode = 'unknown', data, error } = {}) {
      const root = document.createElement('section');
      root.className = 'student-events';
      const element = (tag, text) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = String(text);
        return node;
      };
      const value = input => typeof input === 'string' && input.length ? input : '확인 불가';
      const statusText = (kind, code) => {
        const labels = {
          access: { allowed: '접속 허용', denied: '접속 거부', unknown: '확인 불가' },
          session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
          device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
        };
        return typeof code === 'string' && Object.hasOwn(labels[kind], code) ? labels[kind][code] + '(' + code + ')' : '확인 불가(unknown)';
      };
      const kindText = kind => kind === 'access' ? '접속 기록(access)' : kind === 'xdr' ? 'XDR 경보(xdr)' : '확인 불가(' + value(kind) + ')';
      const appText = id => typeof id === 'string' && id.length ? id : '앱을 확인할 수 없습니다';
      root.append(element('h3', '내 접속 기록·저장된 XDR 경보'));
      const modes = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      root.append(element('p', '연결 모드: ' + (Object.hasOwn(modes, mode) ? modes[mode] : modes.unknown)));
      if (status === 'loading') {
        root.append(element('p', '기록을 불러오는 중'));
        return root;
      }
      if (status === 'error') {
        root.append(element('p', '기록을 불러오지 못했습니다: ' + value(error?.message)));
        if (error?.code === 'CONTRACT_MISMATCH') root.append(element('p', '확인 불가: 서버 응답 형식을 확인할 수 없습니다.'));
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        root.append(element('p', '확인 불가: 기록 조회 결과를 확인할 수 없습니다.'));
        return root;
      }
      // 필터와 상세 선택은 이번 호출의 DOM 안에만 두어 새 입력 때 초기화한다.
      const events = [...data].sort((a, b) => {
        const time = input => Number.isFinite(Date.parse(input)) ? Date.parse(input) : -Infinity;
        const left = time(a.at), right = time(b.at);
        return left === right ? 0 : left > right ? -1 : 1;
      });
      const filters = element('div');
      const makeFilter = (name, values, label) => {
        const select = element('select');
        select.setAttribute('aria-label', name);
        const all = element('option', '전체');
        all.value = 'all';
        select.append(all);
        for (const input of [...new Set(values)].filter(v => typeof v === 'string' && v.length && v !== 'all')) {
          const option = element('option', label(input));
          option.value = input;
          select.append(option);
        }
        select.value = 'all';
        const wrapper = element('label', name + ' ');
        wrapper.append(select);
        filters.append(wrapper);
        return select;
      };
      const kindFilter = makeFilter('기록 종류', events.map(e => e.kind), kindText);
      const appFilter = makeFilter('업무 앱', events.map(e => e.appId), appText);
      const accessFilter = makeFilter('접속 상태', events.map(e => e.state?.access), code => statusText('access', code));
      const count = element('p');
      const list = element('ul');
      const detail = element('section');
      detail.setAttribute('aria-live', 'polite');
      const showDetail = event => {
        detail.replaceChildren();
        const content = element('section');
        content.setAttribute('data-student-event-detail', event.id);
        content.append(element('h4', event.id + ' 상세'), element('p', '사건 ID: ' + value(event.id)), element('p', '업무 앱: ' + appText(event.appId)));
        for (const [key, title] of [['evidence', '근거'], ['rules', '규칙']]) {
          const group = element('section');
          group.append(element('h5', title));
          const entries = Array.isArray(event[key]) ? event[key] : [];
          if (!entries.length) group.append(element('p', '표시할 ' + title + '가 없습니다.'));
          for (const entry of entries) group.append(element('p', 'ID: ' + value(entry.id) + ' · 내용: ' + value(entry.text)));
          content.append(group);
        }
        const states = element('dl');
        for (const [key, title] of [['access', '접속 상태'], ['session', '세션 상태'], ['device', '기기 상태']]) {
          states.append(element('dt', title), element('dd', statusText(key, event.state?.[key])));
        }
        content.append(states);
        if (Array.isArray(event.supportedActions) && event.supportedActions.length) {
          content.append(element('p', '조치 실행 연결은 준비 중입니다. 아직 지원하지 않는 조치이며 요청을 보내지 않습니다.'));
          for (const action of event.supportedActions) {
            const unsupported = element('button', action + ' 미지원');
            unsupported.type = 'button';
            unsupported.disabled = true;
            content.append(unsupported);
          }
        }
        detail.append(content);
      };
      const renderList = () => {
        list.replaceChildren();
        detail.replaceChildren();
        const visible = events.filter(event =>
          (kindFilter.value === 'all' || event.kind === kindFilter.value) &&
          (appFilter.value === 'all' || event.appId === appFilter.value) &&
          (accessFilter.value === 'all' || event.state?.access === accessFilter.value));
        count.textContent = '표시 기록: ' + visible.length + '건 / 받은 기록: ' + events.length + '건';
        if (!visible.length) list.append(element('li', '표시할 기록이 없습니다'));
        for (const event of visible) {
          const row = element('li');
          row.setAttribute('data-student-event-id', event.id);
          row.append(
            element('p', '사건 ID: ' + value(event.id)),
            element('p', '시각: ' + value(event.at)),
            element('p', '종류: ' + kindText(event.kind)),
            element('p', '업무 앱: ' + appText(event.appId)),
            element('p', '요약: ' + value(event.summary)),
          );
          const button = element('button', event.id + ' 상세');
          button.type = 'button';
          button.addEventListener('click', () => showDetail(event));
          row.append(button);
          list.append(row);
        }
      };
      for (const select of [kindFilter, appFilter, accessFilter]) select.addEventListener('change', renderList);
      root.append(filters, count, list, detail);
      renderList();
      return root;
    },
    renderStatus({ devices, sessions, notifications = [], diagnostics, mode = 'unknown' } = {}) {
      const root = document.createElement('section');
      root.className = 'student-status';
      const element = (tag, text) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = String(text);
        return node;
      };
      // 허용된 문자열만 표시한다. 비밀 형태가 섞인 메시지는 원문을 노출하지 않는다.
      const safe = input => {
        if (typeof input !== 'string' || !input.length) return '확인 불가';
        if (/(?:bearer\s+|eyJ[A-Za-z0-9_-]+\.|sb_secret_|sk-[A-Za-z0-9]|-----BEGIN|(?:password|passwd|token|secret|api[_ -]?key|비밀번호|토큰|인증키)\s*[:=])/i.test(input)) return '[비밀값 포함 가능: 숨김]';
        return input;
      };
      const modeText = input => {
        const labels = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
        return Object.hasOwn(labels, input) ? labels[input] + '(' + input + ')' : '확인 불가(unknown)';
      };
      const stateText = (kind, code) => {
        const labels = kind === 'device'
          ? { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' }
          : { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
        return typeof code === 'string' && Object.hasOwn(labels, code) ? labels[code] + '(' + code + ')' : '확인 불가(unknown)';
      };
      const retry = group => group.append(element('p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.'));
      const failure = (group, title, resource) => {
        const timeout = /TIMEOUT|TIMED_OUT/i.test(resource?.error?.code ?? '');
        group.append(element('p', title + '를 불러오지 못했습니다' + (timeout ? ' (시간 초과)' : '') + ': ' + safe(resource?.error?.message)));
        retry(group);
      };
      root.append(element('h3', '기기·현재 연결·알림·도움정보'));
      root.append(element('p', '연결 모드: ' + modeText(mode)));
      for (const [resource, title, kind, empty] of [
        [devices, '기기 목록', 'device', '등록된 기기가 없습니다'],
        [sessions, '현재 연결', 'session', '현재 연결이 없습니다'],
      ]) {
        const group = element('section');
        group.append(element('h4', title), element('p', '연결 모드: ' + modeText(resource?.mode ?? mode)));
        if (resource?.status === 'loading') group.append(element('p', title + ' 불러오는 중'));
        else if (resource?.status === 'error') failure(group, title, resource);
        else if (resource?.status === 'ok' && Array.isArray(resource.data)) {
          if (!resource.data.length) group.append(element('p', empty));
          const list = element('ul');
          for (const item of resource.data) list.append(element('li', kind === 'device'
            ? '기기 이름: ' + safe(item.label) + ' · 기기 ID: ' + safe(item.id) + ' · 보안 상태: ' + stateText(kind, item.status)
            : '세션 ID: ' + safe(item.id) + ' · 세션 상태: ' + stateText(kind, item.status)));
          group.append(list);
        } else {
          group.append(element('p', title + ' 확인 불가'));
          retry(group);
        }
        if (kind === 'session') group.append(element('p', '세션 조회 범위는 현재 검증된 연결 하나입니다. 과거 세션 전체 목록이 아닙니다.'));
        root.append(group);
      }

      const alerts = element('section');
      alerts.append(element('h4', '알림'));
      if (Array.isArray(notifications) && notifications.length === 0) alerts.append(element('p', '주의할 알림이 없습니다'));
      else if (Array.isArray(notifications)) {
        const list = element('ul');
        for (const notice of notifications) list.append(element('li', '자료(resource): ' + safe(notice.resource) + ' · 코드(code): ' + safe(notice.code) + ' · 안내: ' + safe(notice.message)));
        alerts.append(list);
      } else alerts.append(element('p', '알림 확인 불가'));
      root.append(alerts);

      const help = element('section');
      help.append(element('h4', '도움정보'), element('p', '도움 요청에 사용할 안전한 점검 필드만 복사합니다.'));
      const copy = element('button', '도움정보 복사');
      copy.type = 'button';
      copy.disabled = true;
      const feedback = element('p');
      feedback.setAttribute('role', 'status');
      let copyText = '';
      help.append(element('p', '연결 모드: ' + modeText(diagnostics?.mode ?? mode)));
      if (diagnostics?.status === 'loading') help.append(element('p', '도움정보 불러오는 중'));
      else if (diagnostics?.status === 'error') {
        failure(help, '도움정보', diagnostics);
        help.append(element('p', '진단 조회 재시도는 제공 화면의 도움정보 불러오기 버튼을 직접 누르세요.'));
      } else if (diagnostics?.status === 'ok' && diagnostics.data && typeof diagnostics.data === 'object' && !Array.isArray(diagnostics.data) && Object.keys(diagnostics.data).length > 0) {
        const data = diagnostics.data;
        // 전체 응답을 직렬화하지 않는다. 이 여섯 필드 외에는 표시·복사하지 않는다.
        const projected = {
          requestId: safe(data.requestId),
          component: safe(data.component),
          version: safe(data.version),
          checkedAt: safe(data.checkedAt),
          engine: { mode: safe(data.engine?.mode), code: safe(data.engine?.code) },
        };
        const values = element('dl');
        for (const [key, value] of [
          ['requestId', projected.requestId], ['component', projected.component],
          ['version', projected.version], ['checkedAt', projected.checkedAt],
          ['engine.mode', projected.engine.mode], ['engine.code', projected.engine.code],
        ]) values.append(element('dt', key), element('dd', value));
        help.append(values);
        copyText = JSON.stringify(projected, null, 2);
        copy.disabled = false;
      } else {
        help.append(element('p', diagnostics?.status === 'ok' ? '표시할 도움정보가 없습니다' : '도움정보 확인 전 또는 결과 없음'));
        help.append(element('p', '제공 화면의 도움정보 불러오기 버튼을 직접 누르세요.'));
      }
      copy.addEventListener('click', async () => {
        if (copy.disabled || !copyText) return;
        try {
          await navigator.clipboard.writeText(copyText);
          feedback.textContent = '도움정보를 복사했습니다.';
        } catch {
          feedback.textContent = '도움정보를 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인하고 직접 다시 누르세요.';
        }
      });
      help.append(copy, feedback);
      root.append(help);
      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection({ status = 'idle', mode, data, error, checkedAt } = {}) {
      const root = document.createElement('section');
      paragraph(root, '다시 점검하려면 현재 API 연결 점검 버튼을 직접 누르세요.');
      if (mode === 'demo') paragraph(root, '예제 자료');
      if (mode === 'disconnected') paragraph(root, '연결 없음');
      if (mode === 'unknown') paragraph(root, '확인 불가');
      if (status === 'idle') {
        paragraph(root, 'AI 연결 점검 전');
      } else if (status === 'loading') {
        paragraph(root, 'AI 연결 점검 중');
      } else if (status === 'ok') {
        const authorization = data?.audienceAuthorization;
        if (data?.transportChecked !== true || !['test', 'verified'].includes(authorization)) {
          paragraph(root, 'AI 연결 점검 결과 확인 불가. 담당자에게 계정 연결과 앱 권한 확인을 요청하세요.');
          return root;
        }
        paragraph(root, authorization === 'test' ? '시험 연결 점검(test)' : '앱 권한 확인 후 점검(verified)');
        paragraph(root, `모델 수: ${Number.isSafeInteger(data.modelCount) && data.modelCount >= 0 ? data.modelCount : '확인 불가'}`);
        paragraph(root, `점검 시각: ${typeof checkedAt === 'string' ? checkedAt : '확인 불가'}`);
        paragraph(root, '연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다. 보안 기록에서 별도로 요청하고 확인하세요.');
      } else {
        paragraph(root, `AI 연결 점검 실패: ${aiError(error)}`);
        if (!Object.hasOwn(AI_MESSAGES, error?.code) || error?.code === 'AI_REQUEST_UNVERIFIED') {
          paragraph(root, '담당자에게 계정 연결과 앱 권한을 확인하고, 네트워크 상태 확인 후 잠시 뒤 직접 다시 점검하세요.');
        }
        if (error?.code === 'WB_CLCO_AUTH_REQUIRED' || error?.code === 'WB_CLCO_ACCESS_BLOCKED') {
          paragraph(root, '계정 연결을 다시 확인하고 담당자에게 앱 이용 권한 확인을 요청하세요.');
        }
        if (error?.code === 'MODEL_NOT_CONFIGURED') paragraph(root, '담당자에게 모델 허용 설정 확인을 요청하세요.');
      }
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');
      if (explanation?.status === 'ok') {
        root.setAttribute('data-student-explanation-event', String(event?.id ?? ''));
        paragraph(root, `사건 ID: ${event?.id ?? '확인 불가'}`);
        paragraph(root, typeof explanation.data?.summary === 'string' ? explanation.data.summary : '사건 설명 확인 불가');
        paragraph(root, `설명 확인 시각: ${typeof checkedAt === 'string' ? checkedAt : '확인 불가'}`);
      } else if (explanation?.status === 'loading') {
        paragraph(root, '사건 설명 요청 중');
      } else if (!explanation || explanation.status === 'idle') {
        paragraph(root, '사건 설명 요청 전. 연결 점검만으로 사건 설명이 실행되지는 않습니다.');
      } else {
        paragraph(root, `사건 설명 요청 실패: ${aiError(explanation.error)}`);
        paragraph(root, '기록은 그대로 유지됩니다.');
      }
      return root;
    },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
