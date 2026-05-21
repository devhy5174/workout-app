export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-10 max-w-lg mx-auto">
      <h1 className="text-xl font-extrabold text-gray-800 mb-1">개인정보 처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2026년 5월 20일</p>

      <div className="flex flex-col gap-5 text-gray-600">
        <p className="text-xs leading-relaxed">
          함께걸어요(이하 "서비스")는 이용자의 개인정보를 소중히 여기며,
          「개인정보 보호법」을 준수합니다. 본 방침은 서비스가 수집하는
          개인정보의 항목, 이용 목적, 보유 기간 및 이용자 권리를 안내합니다.
        </p>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제1조. 수집하는 개인정보 항목</p>
          <p className="text-xs font-semibold text-gray-500 mb-1">① 회원가입 및 프로필</p>
          <p className="text-xs leading-relaxed mb-2">
            이메일 주소, 닉네임, 성별, 나이, 신장(cm), 체중(kg), BMI, 활동
            유형(산책·파워워킹·러닝·등산), 캐릭터 선택, 앱 테마·언어 설정
          </p>
          <p className="text-xs font-semibold text-gray-500 mb-1">② 소셜 로그인</p>
          <p className="text-xs leading-relaxed mb-2">
            카카오 또는 구글 계정으로 가입 시 해당 플랫폼으로부터 이메일
            주소를 제공받습니다.
          </p>
          <p className="text-xs font-semibold text-gray-500 mb-1">③ 운동 기록</p>
          <p className="text-xs leading-relaxed mb-2">
            운동 날짜, 걸음수, 이동거리(km), 소모 칼로리, 운동 시간(분),
            운동 유형, 목표 달성 여부, 획득 포인트
          </p>
          <p className="text-xs font-semibold text-gray-500 mb-1">④ 파티·커뮤니티 활동</p>
          <p className="text-xs leading-relaxed mb-2">
            파티 참가 기록, 작성한 커뮤니티 게시물 및 응원, 파티 내
            공지·응원 메시지
          </p>
          <p className="text-xs font-semibold text-gray-500 mb-1">⑤ 알림 및 기기 정보</p>
          <p className="text-xs leading-relaxed">
            웹 푸시 알림 동의 시 기기 엔드포인트(endpoint), 암호화
            키(p256dh, auth)가 수집됩니다. 알림 수신 여부와 설정 정보는 기기
            로컬 저장소(localStorage)에 저장됩니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제2조. 개인정보 수집 및 이용 목적</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
            <li>회원 식별 및 서비스 제공</li>
            <li>운동 기록 저장·분석 및 맞춤 목표·식단 가이드 제공</li>
            <li>포인트·칭호 이벤트 보상 관리</li>
            <li>파티·커뮤니티 소셜 기능 운영</li>
            <li>운동 스트릭, 목표 달성 알림 발송</li>
            <li>부정 이용 방지 및 서비스 품질 개선</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제3조. 개인정보 보유 및 이용 기간</p>
          <p className="text-xs leading-relaxed">
            회원 탈퇴 시까지 보유하며, 탈퇴 후 지체 없이 파기합니다. 단,
            관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 별도
            보관합니다.
          </p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1 mt-1">
            <li>전자상거래 관련 기록: 5년 (전자상거래법)</li>
            <li>소비자 불만·분쟁 기록: 3년 (전자상거래법)</li>
            <li>접속 로그: 3개월 (통신비밀보호법)</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제4조. 개인정보 처리 위탁</p>
          <p className="text-xs leading-relaxed mb-2">
            서비스는 원활한 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다.
          </p>
          <div className="bg-white rounded-xl p-3 flex flex-col gap-2 border border-gray-100">
            {[
              { company: "Supabase Inc. (미국)", task: "데이터베이스·인증·실시간 동기화 서버 운영" },
              { company: "Kakao Corp. (한국)", task: "카카오 소셜 로그인 인증" },
              { company: "Google LLC (미국)", task: "구글 소셜 로그인 인증" },
            ].map(({ company, task }) => (
              <div key={company}>
                <p className="text-xs font-bold text-gray-700">{company}</p>
                <p className="text-xs text-gray-500">{task}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            위탁 업체는 위탁받은 업무 범위 내에서만 개인정보를 처리합니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제5조. 제3자 제공</p>
          <p className="text-xs leading-relaxed">
            법령에 따른 경우(수사기관 요청 등)를 제외하고, 이용자의 동의
            없이 개인정보를 제3자에게 제공하지 않습니다. 커뮤니티·파티
            기능에서 이용자가 직접 공개한 닉네임, 게시물, 걸음수 등은 다른
            이용자에게 노출될 수 있습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제6조. 이용자의 권리</p>
          <p className="text-xs leading-relaxed mb-1">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
            <li>개인정보 열람 요청</li>
            <li>오류 정정 요청 (닉네임·신체 정보 등 앱 내에서 직접 수정 가능)</li>
            <li>처리 정지 및 삭제 요청 (아래 문의처로 연락)</li>
            <li>회원 탈퇴 (아래 문의처로 연락)</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제7조. 개인정보의 안전성 확보 조치</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
            <li>HTTPS(TLS) 암호화 통신 적용</li>
            <li>Supabase Row Level Security(RLS)를 통한 데이터 접근 제어</li>
            <li>비밀번호는 bcrypt 해시 처리되어 저장</li>
            <li>관리자 계정 별도 권한 관리</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제8조. 자동 수집 정보</p>
          <p className="text-xs leading-relaxed">
            서비스는 편의 기능을 위해 브라우저 localStorage에 앱 설정, 운동
            기록 캐시, 알림 설정 등을 저장합니다. 이는 이용자 기기에만
            저장되며, 서버로 별도 전송되지 않습니다. 브라우저 데이터 삭제 시
            함께 삭제됩니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-2">제9조. 개인정보 보호책임자 및 문의</p>
          <div className="bg-white rounded-xl p-3 text-xs space-y-1 border border-gray-100">
            <p><span className="font-semibold text-gray-700">서비스명:</span> 함께걸어요</p>
            <p><span className="font-semibold text-gray-700">문의 이메일:</span> devhy5174@gmail.com</p>
            <p><span className="font-semibold text-gray-700">카카오톡 채널:</span> 앱 설정 &gt; 문의하기</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            개인정보 침해 관련 신고는 개인정보보호위원회(privacy.go.kr) 또는
            한국인터넷진흥원(118)에 문의하실 수 있습니다.
          </p>
        </div>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 앱 내
          공지를 통해 안내합니다.
        </p>
      </div>
    </div>
  );
}
