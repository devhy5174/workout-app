import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDirectionsRun } from "react-icons/md";
import { supabase } from "../lib/supabase";

const BG = "linear-gradient(150deg, #ffac60 0%, #ff7433 40%, #ff5733 75%, #e8401a 100%)";

type Status = "loading" | "ready" | "done" | "error";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Supabase가 URL 해시에서 토큰을 자동으로 처리함
    // PASSWORD_RECOVERY 이벤트가 오면 비밀번호 입력 화면으로 전환
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      } else if (event === "SIGNED_IN" && status === "loading") {
        // 이미 세션이 있으면 바로 ready
        setStatus("ready");
      }
    });

    // 타임아웃: 5초 내 이벤트 없으면 링크 만료로 처리
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (error) {
      setError("비밀번호 변경에 실패했어요. 링크가 만료됐을 수 있어요.");
    } else {
      setStatus("done");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: BG }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div
            className="mb-4"
            style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.3))" }}
          >
            <MdDirectionsRun className="text-white mx-auto" style={{ fontSize: "5rem" }} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            비밀번호 재설정
          </h1>
        </div>

        {/* 로딩 */}
        {status === "loading" && (
          <div className="text-center">
            <p className="text-white/70 text-sm animate-pulse">링크 확인 중...</p>
          </div>
        )}

        {/* 링크 만료 */}
        {status === "error" && (
          <div className="text-center w-full">
            <div className="text-6xl mb-5">⏰</div>
            <p className="text-white font-extrabold text-lg mb-2">링크가 만료됐어요</p>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              재설정 링크는 1시간 동안만 유효해요.<br />
              다시 요청해주세요.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-4 rounded-2xl font-bold text-sm"
              style={{ background: "white", color: "var(--color-primary)" }}
            >
              비밀번호 찾기로 이동
            </button>
          </div>
        )}

        {/* 새 비밀번호 입력 */}
        {status === "ready" && (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <input
              type="password"
              placeholder="새 비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
              required
              minLength={6}
              autoFocus
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
              required
            />
            {error && (
              <p className="text-white/90 text-xs bg-white/20 py-2 px-3 rounded-xl">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="비밀번호 변경"
              className="w-full py-4 rounded-2xl font-black text-sm mt-2 disabled:opacity-50 transition-opacity shadow-sm"
              style={{ background: "white", color: "var(--color-primary)" }}
            >
              {isSubmitting ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}

        {/* 완료 */}
        {status === "done" && (
          <div className="text-center w-full">
            <div className="text-6xl mb-5">✅</div>
            <p className="text-white font-extrabold text-lg mb-2">변경 완료!</p>
            <p className="text-white/60 text-sm mb-8">
              새 비밀번호로 로그인해주세요.
            </p>
            <button
              onClick={() => navigate("/auth", { replace: true })}
              className="w-full py-4 rounded-2xl font-bold text-sm"
              style={{ background: "white", color: "var(--color-primary)" }}
            >
              로그인하러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
