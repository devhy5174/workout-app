import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";
import { RiKakaoTalkFill } from "react-icons/ri";
import loadingLogo from "../assets/images/loadingLogo.png";

const OAUTH_REDIRECT = Capacitor.isNativePlatform()
  ? "com.togetherwalk.app://login-callback"
  : `${window.location.origin}/`;

async function signInWithOAuthNative(provider: "kakao" | "google") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: OAUTH_REDIRECT,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) return error;
  await Browser.open({ url: data.url, windowName: "_self" });
  return null;
}

type Mode = "login" | "signup" | "forgot";

const BG =
  "linear-gradient(150deg, #ffac60 0%, #ff7433 40%, #ff5733 75%, #e8401a 100%)";

export default function Auth() {
  const { login, user, isLoading } = useUser();
  const navigate = useNavigate();

  // OAuth 완료 후 user가 생기면 홈으로 자동 이동 (Android 딥링크 복귀 포함)
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

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
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(toKorean(error.message));
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    setSignupDone(true);
  };

  const handleForgot = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);
    if (error) {
      setError(toKorean(error.message));
    } else {
      setForgotDone(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else handleForgot();
  };

  // 완료: Supabase 대시보드 → Authentication → Providers → Kakao 활성화 후 동작
  // 카카오 디벨로퍼스(developers.kakao.com)에서 REST API 키 발급 필요
  const handleKakaoLogin = async () => {
    setError(null);
    if (Capacitor.isNativePlatform()) {
      const err = await signInWithOAuthNative("kakao");
      if (err) setError(toKorean(err.message));
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: OAUTH_REDIRECT },
      });
      if (error) setError(toKorean(error.message));
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    if (Capacitor.isNativePlatform()) {
      const err = await signInWithOAuthNative("google");
      if (err) setError(toKorean(err.message));
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: OAUTH_REDIRECT },
      });
      if (error) setError(toKorean(error.message));
    }
  };

  // TODO: 애플로그인 보류 진행시 활성화시켜 진행 Supabase 대시보드 → Authentication → Providers → Apple 활성화 후 동작
  // Apple Developer 계정($99/년) + Service ID 발급 필요
  // Capacitor iOS: 나중에 @capacitor/sign-in-with-apple + signInWithIdToken 으로 교체
  // const handleAppleLogin = async () => {
  //   setError(null);
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "apple",
  //     options: { redirectTo: OAUTH_REDIRECT },
  //   });
  //   if (error) setError(toKorean(error.message));
  // };

  if (signupDone) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: BG }}
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
            onClick={() => {
              setMode("login");
              setSignupDone(false);
            }}
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

  if (forgotDone) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: BG }}
      >
        <div className="text-center max-w-sm w-full">
          <div className="text-7xl mb-6">📬</div>
          <h2 className="text-2xl font-black text-white mb-3">
            메일을 확인해주세요
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            <span className="text-white font-semibold">{email}</span>로<br />
            비밀번호 재설정 링크를 보냈어요.
            <br />
            메일함을 확인해주세요.
          </p>
          <button
            onClick={() => {
              setMode("login");
              setForgotDone(false);
              setEmail("");
            }}
            aria-label="로그인으로 이동"
            className="w-full py-4 rounded-2xl font-bold text-sm"
            style={{ background: "white", color: "var(--color-primary)" }}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: BG }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 4px 24px rgba(0,0,0,0.25))",
              marginBottom: "-23px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <img
              src={loadingLogo}
              alt="함께걸어요 로고"
              className="mx-auto"
              style={{ width: "200px", height: "200px", objectFit: "contain" }}
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            함께 걸어요
          </h1>
          <p className="text-white/60 text-sm mt-2">
            걷기 · 러닝 습관 형성 커뮤니티
          </p>
        </div>

        {/* 탭 전환 (forgot 모드일 땐 숨김) */}
        {mode !== "forgot" && (
          <div
            className="flex w-full rounded-2xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
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
        )}

        {/* forgot 모드 헤더 */}
        {mode === "forgot" && (
          <div className="w-full mb-6">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-white/60 text-sm font-semibold mb-4 flex items-center gap-1"
              aria-label="뒤로가기"
            >
              ← 로그인으로
            </button>
            <p className="text-white font-extrabold text-lg">비밀번호 찾기</p>
            <p className="text-white/60 text-xs mt-1">
              가입한 이메일을 입력하면 재설정 링크를 보내드려요.
            </p>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
            required
          />
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none shadow-sm"
              required
              minLength={6}
            />
          )}

          {error && (
            <p className="text-white/90 text-xs bg-white/20 py-2 px-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={
              mode === "login"
                ? "로그인"
                : mode === "signup"
                  ? "회원가입"
                  : "재설정 메일 보내기"
            }
            className="w-full py-4 rounded-2xl font-black text-sm mt-2 disabled:opacity-50 transition-opacity shadow-sm"
            style={{ background: "white", color: "var(--color-primary)" }}
          >
            {isSubmitting
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : mode === "signup"
                  ? "회원가입"
                  : "재설정 메일 보내기"}
          </button>

          {/* 비밀번호 찾기 링크 (로그인 모드에서만) */}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
              }}
              className="w-full text-center text-white/50 text-xs py-1 hover:text-white/80 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          )}
        </form>

        {/* 소셜 로그인 (forgot 모드에서는 숨김) */}
        {mode !== "forgot" && (
          <div className="w-full mt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs font-semibold">또는</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="flex justify-center gap-4">
              {/* 카카오 로그인 */}
              <button
                type="button"
                onClick={handleKakaoLogin}
                disabled={isSubmitting}
                aria-label="카카오로 로그인"
                className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform shadow-md active:scale-95"
                style={{ backgroundColor: "#FEE500" }} // 카카오 공식 노란색 배경
              >
                {/* 노란 동그라미 한가운데에 공식 갈색 말풍선 심볼만 딱 박아줍니다 */}
                <RiKakaoTalkFill
                  size={26} // 버튼 크기(w-11)에 딱 예쁘게 들어가는 사이즈
                  color="#3C1E1E" // 카카오 공식 시그니처 갈색
                />
              </button>

              {/* 구글 로그인 */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                aria-label="Google로 로그인"
                className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform shadow-md active:scale-95"
                style={{ background: "#FFFFFF" }}
              >
                <FcGoogle className="text-[22px]" />
              </button>

              {/* 애플 로그인 */}
              {/* <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isSubmitting}
                aria-label="Apple로 로그인"
                className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform shadow-md active:scale-95"
                style={{ background: "#000000", color: "#FFFFFF" }}
              >
                <FaApple className="text-[22px]" />
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
