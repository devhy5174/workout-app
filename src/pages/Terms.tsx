export default function Terms() {
  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-10 max-w-lg mx-auto">
      <h1 className="text-xl font-extrabold text-gray-800 mb-1">이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2026년 5월 20일</p>

      <div className="flex flex-col gap-5 text-gray-600">
        <p className="text-xs leading-relaxed">
          본 약관은 함께걸어요(이하 "서비스")가 제공하는 운동 기록·파티·커뮤니티
          서비스의 이용 조건 및 절차, 운영자와 회원 간의 권리·의무를 규정합니다.
        </p>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제1조 (목적)</p>
          <p className="text-xs leading-relaxed">
            본 약관은 함께걸어요(이하 "서비스")가 제공하는 운동
            기록·파티·커뮤니티 서비스의 이용 조건 및 절차, 운영자와 회원
            간의 권리·의무를 규정합니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제2조 (약관의 효력 및 변경)</p>
          <p className="text-xs leading-relaxed">
            본 약관은 회원가입 시 동의함으로써 효력이 발생합니다. 운영자는
            필요 시 약관을 변경할 수 있으며, 변경 내용은 앱 내 공지 또는
            알림을 통해 시행 7일 전 안내합니다. 변경 후에도 서비스를 계속
            이용하면 변경된 약관에 동의한 것으로 간주합니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제3조 (회원 가입 및 자격)</p>
          <p className="text-xs leading-relaxed mb-1">
            만 14세 이상이면 누구나 가입할 수 있습니다. 가입 시 정확한
            정보를 입력해야 하며, 허위 정보 입력으로 인한 불이익은 회원
            본인이 부담합니다.
          </p>
          <p className="text-xs leading-relaxed">
            운영자는 다음에 해당하는 경우 가입을 거부하거나 이용을 제한할 수
            있습니다: 타인 명의 도용, 이전에 이용 자격을 박탈당한 경우, 기타
            운영 정책 위반.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제4조 (회원 탈퇴)</p>
          <p className="text-xs leading-relaxed">
            회원은 언제든지 탈퇴를 요청할 수 있으며, 운영자에게
            이메일(devhy5174@gmail.com)로 요청하면 처리됩니다. 탈퇴 시
            칭호·이벤트 보상 등 서비스 내 혜택은 즉시 소멸되며 복구되지
            않습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제5조 (서비스 제공)</p>
          <p className="text-xs leading-relaxed mb-1">서비스는 다음 기능을 제공합니다.</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
            <li>걸음수·운동 기록 저장 및 통계</li>
            <li>파티 생성·참가 및 함께 걷기</li>
            <li>커뮤니티 게시물 작성 및 응원</li>
            <li>칭호·말풍선 등 이벤트 보상</li>
            <li>맞춤 식단 가이드 및 운동 알림</li>
            <li>프리미엄 구독 기능 (향후 제공 예정)</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제6조 (이벤트 보상)</p>
          <p className="text-xs leading-relaxed">
            칭호, 말풍선, 인증카드 프레임 등 이벤트 보상은 서비스 이용
            편의를 위한 가상 혜택이며, 현금·상품권으로 교환하거나 타인에게
            양도·판매할 수 없습니다. 보상은 운영 정책에 따라 조정될 수
            있으며, 회원 탈퇴 또는 서비스 종료 시 소멸됩니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제7조 (유료 서비스)</p>
          <p className="text-xs leading-relaxed mb-2">
            프리미엄 구독 등 유료 서비스 이용 시 별도 안내되는 결제 조건이
            적용됩니다. 구독 결제는 이용 기간 만료 전 자동 갱신될 수 있으며,
            환불은 앱스토어(Google Play, App Store) 환불 정책에 따릅니다.
            콘텐츠 이용 후 단순 변심에 의한 환불은 제한될 수 있습니다.
          </p>
          <p className="font-semibold text-gray-700 text-xs mb-1">구독 취소 방법</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1 mb-2">
            <li>
              <span className="font-medium">Google Play</span>: 구글 플레이
              앱 열기 → 프로필 아이콘 → 결제 및 구독 → 구독 → '함께걸어요'
              선택 → 구독 취소
            </li>
            <li>
              <span className="font-medium">App Store</span>: 설정 앱 →
              Apple ID → 구독 → '함께걸어요' 선택 → 구독 취소
            </li>
          </ul>
          <p className="text-xs leading-relaxed text-gray-500">
            구독을 취소해도 결제된 기간 만료 시까지 프리미엄 서비스를 계속
            이용할 수 있습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제8조 (회원 의무 및 금지 행위)</p>
          <p className="text-xs leading-relaxed mb-1">회원은 다음 행위를 해서는 안 됩니다.</p>
          <ul className="text-xs leading-relaxed list-disc list-inside space-y-1">
            <li>타인의 개인정보 도용 또는 허위 정보 등록</li>
            <li>다른 회원에 대한 욕설·비방·혐오 표현 게시</li>
            <li>서비스 운영을 방해하는 행위 (서버 과부하, 크롤링 등)</li>
            <li>걸음수·운동 기록 조작 등 허위 데이터 입력</li>
            <li>광고·스팸성 게시물 반복 작성</li>
            <li>법령 또는 공서양속에 반하는 행위</li>
          </ul>
          <p className="text-xs text-gray-400 mt-1">
            위반 시 운영자는 사전 통보 없이 이용을 제한하거나 계정을 삭제할
            수 있습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제9조 (게시물 및 콘텐츠)</p>
          <p className="text-xs leading-relaxed">
            회원이 작성한 게시물의 저작권은 해당 회원에게 귀속됩니다. 단,
            운영자는 서비스 운영·홍보 목적으로 게시물을 활용할 수 있으며,
            법령 위반·타인 권리 침해에 해당하는 게시물은 사전 통보 없이
            삭제할 수 있습니다. 회원 탈퇴 후 공개된 게시물은 서비스 운영상
            일정 기간 유지될 수 있습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제10조 (서비스 변경 및 중단)</p>
          <p className="text-xs leading-relaxed">
            운영자는 서비스 내용을 추가·변경·종료할 수 있으며, 중요한 변경은
            사전에 공지합니다. 천재지변, 서버 장애, 기술적 문제 등
            불가항력적 사유로 인한 서비스 중단에 대해 운영자는 책임을 지지
            않습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제11조 (면책 조항)</p>
          <p className="text-xs leading-relaxed">
            서비스는 운동 기록 및 건강 정보를 참고용으로 제공합니다.
            식단·운동 정보는 의료적 조언이 아니며, 건강 관련 결정은 전문가와
            상담하시기 바랍니다. 회원 간 파티·커뮤니티 활동에서 발생한
            분쟁은 당사자 간에 해결해야 하며, 운영자는 이에 대한 책임을 지지
            않습니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제12조 (준거법 및 분쟁 해결)</p>
          <p className="text-xs leading-relaxed">
            본 약관은 대한민국 법률에 따라 해석됩니다. 분쟁은 우선 협의로
            해결하며, 합의가 이루어지지 않을 경우 민사소송법상 관할 법원을
            제1심 법원으로 합니다.
          </p>
        </div>

        <div>
          <p className="font-bold text-gray-800 text-sm mb-1">제13조 (문의)</p>
          <div className="bg-white rounded-xl p-3 text-xs space-y-1 border border-gray-100">
            <p><span className="font-semibold text-gray-700">서비스명:</span> 함께걸어요</p>
            <p><span className="font-semibold text-gray-700">이메일:</span> devhy5174@gmail.com</p>
            <p><span className="font-semibold text-gray-700">카카오톡:</span> 설정 &gt; 문의하기</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          본 약관은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 앱 내
          공지를 통해 안내합니다.
        </p>
      </div>
    </div>
  );
}
