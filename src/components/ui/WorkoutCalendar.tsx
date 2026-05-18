import { useState, useMemo } from "react";
import type { WorkoutRecord } from "../../lib/workoutService";

type Props = {
  workoutRecords: WorkoutRecord[];
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatSteps(steps: number): string {
  if (steps >= 10000) return `${(steps / 1000).toFixed(0)}k`;
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
  return String(steps);
}

export default function WorkoutCalendar({ workoutRecords }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const stepsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    workoutRecords.forEach((r) => {
      map[r.date] = (map[r.date] ?? 0) + (r.steps ?? 0);
    });
    return map;
  }, [workoutRecords]);

  const { days, startPad } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { days: daysInMonth, startPad: firstDay };
  }, [year, month]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const cells: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const workedOutCount = useMemo(() => {
    return cells.filter((day) => {
      if (!day) return false;
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return stepsByDate[dateStr] !== undefined;
    }).length;
  }, [cells, stepsByDate, year, month]);

  return (
    <div className="bg-white rounded-3xl shadow-sm">
      <div
        className="px-5 py-4 flex items-center gap-2"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary)18, var(--color-secondary)18)",
        }}
      >
        <p className="font-extrabold text-gray-800">운동 달력</p>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            aria-label="이전 달"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-base"
          >
            ‹
          </button>
          <div className="flex flex-col items-center">
            <p className="font-extrabold text-gray-800 text-sm">
              {year}년 {month + 1}월
            </p>
            {workedOutCount > 0 && (
              <p
                className="text-[10px] font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                이번달 {workedOutCount}일 운동
              </p>
            )}
          </div>
          <button
            onClick={nextMonth}
            aria-label="다음 달"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold text-base"
          >
            ›
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center">
          {DAY_LABELS.map((d, i) => (
            <p
              key={d}
              className={`text-xs font-bold mb-1 ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-gray-400"
              }`}
            >
              {d}
            </p>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const steps = stepsByDate[dateStr];
            const isWorkedOut = steps !== undefined;
            const isToday = dateStr === todayStr;
            const dayOfWeek = (startPad + day - 1) % 7;

            return (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isWorkedOut
                      ? "text-white"
                      : isToday
                        ? "text-gray-800 border-2"
                        : dayOfWeek === 0
                          ? "text-red-400"
                          : dayOfWeek === 6
                            ? "text-blue-400"
                            : "text-gray-600"
                  }`}
                  style={
                    isWorkedOut
                      ? { background: "var(--color-primary)" }
                      : isToday
                        ? { borderColor: "var(--color-primary)" }
                        : {}
                  }
                >
                  {day}
                </div>
                <p
                  className={`text-[9px] font-bold leading-none ${
                    isWorkedOut ? "text-gray-400" : "text-transparent"
                  }`}
                >
                  {isWorkedOut ? formatSteps(steps) : "0"}
                </p>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: "var(--color-primary)" }}
          />
          <p className="text-xs text-gray-400 font-semibold">
            운동한 날 (걸음수 표시)
          </p>
        </div>
      </div>
    </div>
  );
}
