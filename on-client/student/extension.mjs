// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
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
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
