import { useParams, useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { IoFootsteps, IoLocationSharp, IoFlame, IoSpeedometer, IoChevronBack } from "react-icons/io5";
import { useUser } from "../../context/UserContext";
import { getAvatarCharacterById } from "../../data/avatarCharacters";
const RouteMap = lazy(() => import("../ui/RouteMap"));

const WORKOUT_TYPE_META: Record<string, { label: string; emoji: string; title: string }> = {
  walker:       { label: "산책",       emoji: "🚶",   title: "산책 완료"       },
  power_walker: { label: "파워워킹",   emoji: "🚶‍♂️",  title: "파워워킹 완료"   },
  runner:       { label: "달리기",     emoji: "🏃",   title: "달리기 완료"     },
  hiker:        { label: "등산",       emoji: "🏔️",  title: "등산 완료"       },
};

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function formatPace(minPerKm: number): string {
  if (minPerKm <= 0) return "--'--\"";
  const m = Math.floor(minPerKm);
  let s = Math.round((minPerKm - m) * 60);
  const carry = s === 60 ? 1 : 0;
  s = s === 60 ? 0 : s;
  return `${m + carry}'${String(s).padStart(2, "0")}"`;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatClockTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getEncouragement(steps: number, dist: number, goalAchieved: boolean): string {
  if (goalAchieved)    return "목표 달성! 오늘 정말 완벽했어요 🏆";
  if (dist >= 10)      return "10km 완주! 놀라운 체력이에요 🔥";
  if (dist >= 5)       return "5km 이상 완주! 꾸준함이 실력이에요 💪";
  if (steps >= 10000)  return "만 보 달성! 건강한 하루였어요 👏";
  if (steps >= 7000)   return "7,000보 이상! 목표에 한 걸음 더 가까워졌어요 🚀";
  if (steps >= 5000)   return "오늘도 열심히 움직이셨네요! 🙌";
  return "운동 완료! 작은 한 걸음이 큰 변화를 만들어요 🌟";
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workoutRecords, userProfile } = useUser();

  const record = workoutRecords.find((r) => r.id === id);
  const characterImage = getAvatarCharacterById(userProfile?.character_id ?? null)?.image ?? null;

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-bg">
        <span className="text-5xl">🔍</span>
        <p className="font-extrabold text-gray-700">기록을 찾을 수 없어요</p>
        <button
          onClick={() => navigate("/mypage?tab=workout")}
          className="mt-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const typeInfo = WORKOUT_TYPE_META[record.workout_type] ?? { label: record.workout_type, emoji: "🏃", title: "운동 완료" };
  const isGps = (record.gps_distance ?? 0) > 0 || record.distance_source === "gps";
  const effectiveDistance = (record.gps_distance ?? 0) > 0 ? record.gps_distance! : record.distance;
  const paceMinPerKm = record.avg_pace
    ? record.avg_pace
    : effectiveDistance > 0 ? (record.duration / 60) / effectiveDistance : 0;

  const endTime   = record.created_at ? new Date(record.created_at) : null;
  const startTime = endTime ? new Date(endTime.getTime() - record.duration * 1000) : null;

  const encouragement = getEncouragement(record.steps, effectiveDistance, record.goal_achieved);

  return (
    <div className="flex flex-col bg-bg min-h-screen pb-14 overflow-y-auto">

      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={() => navigate("/mypage?tab=workout")}
          aria-label="뒤로가기"
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition"
        >
          <IoChevronBack className="text-xl text-gray-600" />
        </button>
        <h1 className="font-extrabold text-gray-800 text-lg">운동 상세</h1>
      </div>

      <div className="flex flex-col gap-4 px-4">

        {/* ── 히어로 카드 ───────────────────────────────────── */}
        <div
          className="rounded-3xl p-6"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
        >
          {/* 유형 + 날짜 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{typeInfo.emoji}</span>
              <div>
                <p className="text-white font-extrabold text-base leading-tight">{typeInfo.title}</p>
                <p className="text-white/60 text-[11px] mt-0.5">{formatDateFull(record.date)}</p>
              </div>
            </div>
            {record.goal_achieved && (
              <span className="text-xs font-extrabold bg-white/20 text-white px-2.5 py-1 rounded-full">
                🏆 목표달성
              </span>
            )}
          </div>

          {/* 주요 거리 */}
          <div className="flex items-end justify-center gap-2 mb-1">
            <span className="text-white font-extrabold text-6xl leading-none tracking-tight">
              {effectiveDistance.toFixed(2)}
            </span>
            <span className="text-white/70 text-xl font-bold mb-2">km</span>
          </div>
          <div className="flex justify-center mb-5">
            <span
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                isGps ? "bg-emerald-400/30 text-emerald-100" : "bg-white/20 text-white/70"
              }`}
            >
              {isGps ? "📍 GPS 기록" : "📍 추정 거리"}
            </span>
          </div>

          {/* 핵심 3스탯 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "⚡", label: "페이스", value: `${formatPace(paceMinPerKm)}/km` },
              { icon: "⏱", label: "운동 시간", value: formatDuration(record.duration) },
              { icon: "🔥", label: "칼로리", value: `${record.calories}kcal` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white/15 rounded-2xl px-3 py-3 flex flex-col items-center gap-1">
                <span className="text-base">{icon}</span>
                <span className="text-white font-extrabold text-sm leading-tight text-center">{value}</span>
                <span className="text-white/60 text-[10px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 상세 기록 그리드 ──────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div
            className="px-5 py-4"
            style={{ background: "linear-gradient(135deg, var(--color-primary)12, var(--color-secondary)12)" }}
          >
            <p className="font-extrabold text-gray-800">상세 기록</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-gray-50">
            {[
              {
                icon: <IoFootsteps className="text-lg text-emerald-500" />,
                label: "걸음수",
                value: `${record.steps.toLocaleString()}보`,
              },
              {
                icon: <IoSpeedometer className="text-lg text-red-400" />,
                label: "평균 페이스",
                value: `${formatPace(paceMinPerKm)}/km`,
              },
              {
                icon: <span className="text-base">🕐</span>,
                label: "시작 시간",
                value: startTime ? formatClockTime(startTime) : "—",
              },
              {
                icon: <span className="text-base">🕑</span>,
                label: "종료 시간",
                value: endTime ? formatClockTime(endTime) : "—",
              },
              {
                icon: <IoLocationSharp className="text-lg text-blue-400" />,
                label: "거리 출처",
                value: isGps ? "GPS 실측" : "걸음수 추정",
              },
              {
                icon: <IoFlame className="text-lg text-orange-400" />,
                label: "소모 칼로리",
                value: `${record.calories}kcal`,
              },
              ...(isGps && record.gps_distance
                ? [{
                    icon: <span className="text-base">📡</span>,
                    label: "GPS 거리",
                    value: `${record.gps_distance.toFixed(2)}km`,
                  }]
                : []),
              {
                icon: <span className="text-base">{typeInfo.emoji}</span>,
                label: "운동 유형",
                value: typeInfo.label,
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white px-4 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                  <p className="text-sm font-extrabold text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 캐릭터 응원 ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm p-5 flex items-center gap-4">
          {characterImage ? (
            <img
              src={characterImage}
              alt="캐릭터"
              className="w-14 h-14 rounded-2xl object-contain flex-shrink-0"
              style={{ background: "var(--color-primary-light)" }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "var(--color-primary-light)" }}
            >
              {typeInfo.emoji}
            </div>
          )}
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 font-semibold mb-1">
              {userProfile?.nickname ?? ""}의 운동 기록
            </p>
            <p className="text-sm font-extrabold text-gray-800 leading-snug">
              {encouragement}
            </p>
          </div>
        </div>

        {/* ── 경로 지도 ─────────────────────────────────────── */}
        {record.route_points && record.route_points.length >= 2 ? (
          <div className="bg-white rounded-3xl shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-gray-800 text-sm">🗺️ 운동 경로</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 출발
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--color-primary)" }} /> 도착
                </span>
              </div>
            </div>
            <Suspense fallback={
              <div className="w-full h-[280px] bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-gray-400 text-sm">🗺️ 지도 로딩 중...</span>
              </div>
            }>
              <RouteMap points={record.route_points} />
            </Suspense>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 p-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
              🗺️
            </div>
            <div className="text-center">
              <p className="font-extrabold text-gray-700 text-sm">경로 지도</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                이 기록에는 GPS 경로 데이터가 없어요
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
