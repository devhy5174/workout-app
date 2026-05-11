import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";

type Mode = "login" | "signup";

const gradientStyle = {
  background: "linear-gradient(160deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
};

export default function Auth() {
  const { login } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const toKorean = (msg: string): string => {
     if (msg.includes("Invalid login credentials"))
      return "이메일 또는 비밀번호가 틀렸어요.";
    if (msg.includes("Email not confirmed"))
      return "이메일 인증을 완료해주세요. 받은 메일함을 확인하세요.";
    if (msg.includes("User already registered"))
      return "이미 가입된 이메일이에요.";
    if (msg.includes("Password should be at least"))
      return "비밀번호는 6자 이상이어야 해요.";
    if (msg.includes("Unable to validate email"))
      return "올바른 이메일 형식이 아니에요.";
    if (msg.includes("Email rate limit exceeded"))
      return "잠시 후 다시 시도해주세요.";
    if (msg.includes("over_email_send_rate_limit"))
      return "이메일 전송 한도를 초과했어요. 잠시 후 다시 시도해주세요.";
    if (msg.includes("network") || msg.includes("fetch"))
      return "네트워크 연결을 확인해주세요.";
    return "오류가 발생했어요. 다시 시도해주세요.";
  };

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error } = await login(email, password);
    setIsSubmitting(false);
    if (error) {
      setError(toKorean(error));
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleSignup = async () => {
    setError(null);
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(toKorean(error.message));
      setIsSubmitting(false);
      return;
    }
    if (data.user) {
      await supabase.from("app_users").insert({
        id: data.user.id,
        nickname: nickname.trim(),
      });
    }
    setIsSubmitting(false);
    setSignupDone(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else handleSignup();
  };

  if (signupDone) {
    return (
       <div
        className="min-h-screen flex items-center justify-center p-6"
        style={gradientStyle}
      >
        <div className="text-center max-w-sm w-full">
          <div className="text-7xl mb-6">📧</div>
           <h2 className="text-2xl font-black text-white mb-3">
            이메일을 확인해주세요
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            <span className="text-white font-semibold">{email}</span>로<br />
            인증 메일을 보냈어요. 확인 후 로그인해주세요.
          </p>
          <button
            onClick={() => { setMode("login"); setSignupDone(false); }}
            aria-label="로그인으로 이동"
            className="w-full py-4 rounded-2xl font-bold text-sm"
            style={{ background: "white", color: "var(--color-primary)" }}
          >
            로그인으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={gradientStyle}>
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="text-8xl mb-4 drop-shadow-lg">🏃</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workout</h1>
          <p className="text-white/60 text-sm mt-2">함께 운동하고 포인트를 모아요</p>
        </div>

        {/* 탭 전환 */}
        <div
          className="flex w-full rounded-2xl p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={
                mode === m
                  ? { background: "white", color: "var(--color-primary)" }
                  : { color: "rgba(255,255,255,0.6)" }
              }
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
              required
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
            required
            minLength={6}
          />

          {error && (
            <p className="text-white/90 text-xs px-1 bg-white/20 py-2 px-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={mode === "login" ? "로그인" : "회원가입"}
            className="w-full py-4 rounded-2xl font-black text-sm mt-2 disabled:opacity-50 transition-opacity shadow-sm"
            style={{ background: "white", color: "var(--color-primary)" }}
          >
            {isSubmitting ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}