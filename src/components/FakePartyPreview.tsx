import { useState, useEffect, useRef } from "react";
import { HiUserGroup } from "react-icons/hi";
import {
  FAKE_PARTY_MEMBERS,
  FAKE_PARTY_CHEERS,
  type FakeMember,
} from "../data/fakeUsers";

const TODAY_TOTAL_STEPS = FAKE_PARTY_MEMBERS.filter((m) => !m.inactive7).reduce(
  (s, m) => s + m.todaySteps,
  0,
);
const MEMBER_COUNT = FAKE_PARTY_MEMBERS.length;
const TARGET_TOTAL = 10000 * MEMBER_COUNT;
const TODAY_PCT = Math.min(Math.round((TODAY_TOTAL_STEPS / TARGET_TOTAL) * 100), 100);
const ACTIVE_COUNT = FAKE_PARTY_MEMBERS.filter((m) => m.isActive).length;
const PREVIEW_IMAGES = FAKE_PARTY_MEMBERS.slice(0, 3).map((m) => m.image);

// ── 응원 티커 ─────────────────────────────────────────────
function FakeCheerTicker({ messages }: { messages: typeof FAKE_PARTY_CHEERS }) {
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => {
    if (messages.length <= 1) return;
    const t = setInterval(() => setTransitioning(true), 3500);
    return () => clearInterval(t);
  }, [messages.length]);

  const handleEnterEnd = () => {
    const next = (idxRef.current + 1) % messages.length;
    setIdx(next);
    idxRef.current = next;
    setTransitioning(false);
  };

  const curr = messages[idx % messages.length];
  const next = messages[(idx + 1) % messages.length];

  const renderMsg = (m: (typeof FAKE_PARTY_CHEERS)[0]) => (
    <>
      <span
        className="font-extrabold shrink-0 px-1.5 py-0.5 rounded-full text-[9px] whitespace-nowrap"
        style={{ color: "var(--color-primary)", background: "var(--color-primary-light)" }}
      >
        {m.nickname}
      </span>
      <span className="text-[11px] text-gray-500 truncate">{m.text}</span>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 h-9 flex items-center gap-2.5 overflow-hidden">
      <span className="text-gray-300 text-xs shrink-0">💬</span>
      <style>{`
        @keyframes fakeExitUp { from{transform:translateY(0);opacity:1} to{transform:translateY(-110%);opacity:0} }
        @keyframes fakeEnterBelow { from{transform:translateY(110%);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
      <div className="flex-1 relative h-5 overflow-hidden">
        <div
          key={idx}
          className="absolute inset-0 flex items-center gap-1.5"
          style={transitioning ? { animation: "fakeExitUp 0.38s ease-in-out forwards" } : undefined}
        >
          {renderMsg(curr)}
        </div>
        {transitioning && (
          <div
            key="enter"
            className="absolute inset-0 flex items-center gap-1.5"
            style={{ animation: "fakeEnterBelow 0.38s ease-in-out forwards" }}
            onAnimationEnd={handleEnterEnd}
          >
            {renderMsg(next)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 멤버 카드 ─────────────────────────────────────────────
function FakeMemberCard({ m }: { m: FakeMember }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 말풍선 / 상태 뱃지 */}
      <div className="h-5 flex items-end justify-center">
        {m.inactive7 ? (
          <p className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-300 whitespace-nowrap">
            7일 비활동
          </p>
        ) : m.isActive && m.bubble ? (
          <div className="flex flex-col items-center">
            <span
              className={`${m.bubble.colorClass} ${
                m.bubble.darkText ? "text-stone-800" : "text-white"
              } text-[7px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap`}
            >
              {m.bubble.text}
            </span>
            <div className={`w-1.5 h-1.5 rotate-45 rounded-[1px] -mt-1 ${m.bubble.colorClass.split(" ")[0]}`} />
          </div>
        ) : (
          <p className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 whitespace-nowrap">
            쉬는 중
          </p>
        )}
      </div>

      {/* 아바타 */}
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${
            m.inactive7
              ? "bg-gray-100"
              : m.isActive
              ? "bg-primary-light"
              : "bg-gray-100 grayscale opacity-40"
          }`}
        >
          {m.inactive7 ? (
            <span className="text-gray-300 text-2xl">👤</span>
          ) : (
            <img src={m.image} alt={m.nickname} className="w-full h-full object-contain" draggable={false} />
          )}
        </div>
        {m.isActive && !m.inactive7 && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* 닉네임 */}
      <p
        className={`text-[10px] font-bold text-center w-full truncate leading-tight ${
          m.inactive7 ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {m.title ? `${m.title.split(" ")[0]} ` : ""}
        {m.nickname.length > 6 ? `${m.nickname.slice(0, 6)}…` : m.nickname}
        {m.isLeader ? "👑" : ""}
      </p>

      {/* 걸음수 */}
      <div className="h-4 flex items-center justify-center">
        {!m.inactive7 && (
          <p className={`text-[9px] font-bold ${m.isActive ? "text-emerald-500" : "text-gray-400"}`}>
            {m.todaySteps.toLocaleString()}보
          </p>
        )}
      </div>
    </div>
  );
}

// ── 파티 상세 오버레이 ─────────────────────────────────────
function FakePartyDetailOverlay({ onClose }: { onClose: () => void }) {
  const [cheerInput, setCheerInput] = useState("");
  const [cheers, setCheers] = useState(FAKE_PARTY_CHEERS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const sendCheer = () => {
    const text = cheerInput.trim();
    if (!text) return;
    setCheers((prev) => [...prev, { id: `u-${Date.now()}`, nickname: "나", text }].slice(-20));
    setCheerInput("");
  };

  const mvp = [...FAKE_PARTY_MEMBERS]
    .filter((m) => !m.inactive7)
    .sort((a, b) => b.todaySteps - a.todaySteps)[0];

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <FakeCheerTicker messages={cheers} />
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="shrink-0 h-8 px-3 rounded-2xl bg-white shadow-sm flex items-center gap-1 text-gray-500 text-[11px] font-bold active:scale-95 transition"
        >
          <HiUserGroup className="text-sm" />
          목록
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
        {/* 기본 정보 */}
        <div className="bg-white rounded-3xl shadow-sm px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-2xl flex-shrink-0">
              🌅
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-extrabold text-gray-800 text-sm truncate">
                  매일 새벽 6시, 러닝크루 모집
                </p>
                <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full shrink-0">
                  👑 방장
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">새벽 10,000보 함께 달려요!</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[`👥 ${MEMBER_COUNT}/${MEMBER_COUNT}명`, "👟 10,000보", "🌅 새벽"].map((tag) => (
              <span key={tag} className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
            {["러닝", "새벽", "건강"].map((t) => (
              <span key={t} className="text-[10px] bg-gray-100 text-gray-400 rounded-full px-2 py-1 font-semibold">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* 파티 공지 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <p className="text-sm font-extrabold text-gray-700">📢 파티 공지</p>
          <div className="flex items-start gap-2 bg-orange-50 rounded-2xl px-4 py-3">
            <p className="flex-1 text-xs text-gray-700 leading-relaxed font-semibold">
              오늘 날씨 좋으니까 다들 열심히 달려봐요! 목표 달성하면 다음주 번개 있을 예정 🎉
            </p>
            <p className="text-[10px] text-gray-400 flex-shrink-0">오늘</p>
          </div>
        </div>

        {/* 오늘 파티 현황 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <p className="text-sm font-extrabold text-orange-400">🔥 오늘 파티 현황</p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700">
              <span className="text-orange-500">{TODAY_TOTAL_STEPS.toLocaleString()}</span>
              {" / "}{TARGET_TOTAL.toLocaleString()}보
            </p>
            <p className="text-xs font-extrabold text-orange-400">{TODAY_PCT}%</p>
          </div>
          <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-700"
              style={{ width: `${TODAY_PCT}%` }}
            />
          </div>
          {mvp && (
            <div className="flex items-center gap-3 bg-amber-50 rounded-2xl px-4 py-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center overflow-hidden">
                  <img src={mvp.image} alt={mvp.nickname} className="w-full h-full object-contain" draggable={false} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 text-base leading-none">🥇</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wide">오늘의 MVP</p>
                <p className="text-sm font-extrabold text-gray-800 leading-tight">{mvp.nickname}</p>
                <p className="text-xs font-bold text-amber-500">{mvp.todaySteps.toLocaleString()}보</p>
              </div>
            </div>
          )}
        </div>

        {/* 멤버 그리드 */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-gray-700">👥 파티 멤버</p>
            <p className="text-[10px] text-gray-400">{ACTIVE_COUNT}명 운동 중</p>
          </div>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {FAKE_PARTY_MEMBERS.map((m) => (
              <FakeMemberCard key={m.id} m={m} />
            ))}
          </div>
        </div>

        {/* 응원 입력 */}
        <div className="bg-white rounded-3xl shadow-sm px-4 py-3 flex items-center gap-2">
          <span className="text-base shrink-0">💬</span>
          <input
            type="text"
            value={cheerInput}
            onChange={(e) => setCheerInput(e.target.value.slice(0, 30))}
            onKeyDown={(e) => e.key === "Enter" && sendCheer()}
            placeholder="응원 메시지 보내기..."
            maxLength={30}
            className="flex-1 text-xs font-semibold text-gray-700 placeholder-gray-300 outline-none bg-transparent"
          />
          <button
            onClick={sendCheer}
            disabled={!cheerInput.trim()}
            aria-label="응원 보내기"
            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition active:scale-90 ${
              cheerInput.trim() ? "bg-primary text-white" : "bg-gray-100 text-gray-300"
            }`}
          >
            🚀
          </button>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white rounded-3xl shadow-sm p-4 flex gap-2 mb-5">
        <button
          onClick={() => showToast("데모 파티예요! 실제 파티를 만들어보세요 🎉")}
          className="flex-1 py-3 rounded-2xl bg-yellow-400 text-white text-sm font-extrabold active:scale-95 transition"
        >
          ⚡ 시작 알림 보내기
        </button>
        <button
          onClick={onClose}
          className="px-4 py-3 rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 active:scale-95 transition"
        >
          나가기
        </button>
      </div>

      {toast && (
        <div className="fixed top-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap">
            <span>✨</span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 파티 리스트 카드 (메인 export) ────────────────────────
export default function FakePartyPreview() {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="relative">
        <div
          className="flex items-center justify-center gap-1.5 py-2 rounded-t-3xl text-[11px] font-bold"
          style={{
            background: "linear-gradient(90deg, var(--color-primary)22, var(--color-secondary)22)",
            color: "var(--color-primary)",
          }}
        >
          <span>✨</span>
          <span>파티를 만들면 이렇게 보여요</span>
          <span>✨</span>
        </div>

        <div className="bg-white rounded-b-3xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl flex-shrink-0">
              🌅
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-extrabold text-gray-800 truncate cursor-pointer active:opacity-70"
                onClick={() => setShowDetail(true)}
              >
                매일 새벽 6시, 러닝크루 모집
              </p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                새벽 10,000보 함께 달려요!
                <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap align-middle">
                  <span className="text-[5px]">🟢</span>{ACTIVE_COUNT}명 운동 중
                </span>
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {["러닝", "새벽", "건강"].map((t) => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowDetail(true)}
              className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2 text-left active:bg-gray-100 transition"
            >
              <div className="flex items-center">
                {PREVIEW_IMAGES.map((img, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full bg-white border-2 border-gray-50 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 10 - i }}
                  >
                    <img src={img} alt="" className="w-8 h-8 object-contain" draggable={false} />
                  </span>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-gray-400">멤버</p>
                <p className="text-xs font-bold text-gray-700">{MEMBER_COUNT} / {MEMBER_COUNT}명</p>
              </div>
            </button>
            <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-base">👣</span>
              <div>
                <p className="text-[10px] text-gray-400">목표 걸음수</p>
                <p className="text-xs font-bold text-gray-700">10,000보/인</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-base">🌅</span>
              <div>
                <p className="text-[10px] text-gray-400">운동 시간대</p>
                <p className="text-xs font-bold text-gray-700">새벽</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-base">👑</span>
              <div>
                <p className="text-[10px] text-gray-400">파티장</p>
                <p className="text-xs font-bold text-gray-700 truncate">jjun_run</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl px-3 py-1.5 flex flex-col gap-1">
            <p className="text-[10px] font-extrabold text-orange-400">🔥 오늘 파티 현황</p>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-700">
                <span className="text-orange-500">{TODAY_TOTAL_STEPS.toLocaleString()}</span>
                {" / "}{TARGET_TOTAL.toLocaleString()}보
              </p>
              <p className="text-[10px] font-bold text-orange-400">{TODAY_PCT}%</p>
            </div>
            <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-700"
                style={{ width: `${TODAY_PCT}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowDetail(true)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              🏆 랭킹 보기
            </button>
            <button
              onClick={() => setShowDetail(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition bg-primary text-white active:scale-95"
            >
              들어가보기 →
            </button>
          </div>
        </div>
      </div>

      {showDetail && <FakePartyDetailOverlay onClose={() => setShowDetail(false)} />}
    </>
  );
}
