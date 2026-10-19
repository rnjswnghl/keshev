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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
