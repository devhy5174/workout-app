// 닉네임 변경 쿨타임 (일 단위) - 30일에 한 번만 변경 가능
export const NICKNAME_CHANGE_COOLDOWN_DAYS = 30;

// 닉네임 길이 제한
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 12;

// 허용 문자: 한글(완성형+자모), 영문, 숫자만 허용 (공백·특수문자 불가)
export const NICKNAME_ALLOWED_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/;

// ─ 금지어 목록 ────────────────────────────────────────────────
// 소문자 / 초성 기준으로 관리. includes 비교 시 toLowerCase() 적용.
export const BLOCKED_WORDS: string[] = [
  // 한국어 욕설·비하
  "시발", "씨발", "씨바", "시바", "씨팔", "시팔",
  "ㅅㅂ", "ㅆㅂ",
  "병신", "ㅂㅅ",
  "개새끼", "개새",
  "지랄", "ㅈㄹ",
  "미친", "미칠",
  "꺼져", "뒤져",
  "창녀", "보지", "자지", "섹스", "섹시",
  "강간", "윤간",
  "새끼", "놈", "년", "쌍년",
  "호구",
  // 영어 욕설
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "pussy",
  // 시스템 예약어 (관리자 사칭 방지)
  "admin", "관리자", "운영자", "master", "system",
];

// ─ 유틸 함수 ─────────────────────────────────────────────────

/** 허용되지 않는 문자(공백·특수문자) 포함 여부 */
export function hasInvalidChars(value: string): boolean {
  return !NICKNAME_ALLOWED_PATTERN.test(value);
}

/** 닉네임 금지어 포함 여부 (욕설 + 시스템 예약어) */
export function hasBannedWord(value: string): boolean {
  const lower = value.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word.toLowerCase()));
}

// 게시글용 금지어 - 시스템 예약어 제외, 욕설만
const POST_BLOCKED_WORDS = BLOCKED_WORDS.filter(
  (w) => !["admin", "관리자", "운영자", "master", "system"].includes(w)
);

/** 게시글 금지어 포함 여부 (욕설만, 시스템 예약어 허용) */
export function hasPostBannedWord(value: string): boolean {
  const lower = value.toLowerCase();
  return POST_BLOCKED_WORDS.some((word) => lower.includes(word.toLowerCase()));
}

/** 자모(초성·중성·종성)가 전체 글자의 30% 초과인지 검사 */
export function hasExcessiveJamo(value: string): boolean {
  const nonSpace = value.replace(/\s/g, "");
  if (nonSpace.length === 0) return false;
  const jamoCount = (nonSpace.match(/[ㄱ-ㅎㅏ-ㅣ]/g) ?? []).length;
  return jamoCount / nonSpace.length > 0.3;
}

/** 3칸 이상 연속 공백 포함 여부 */
export function hasExcessiveSpaces(value: string): boolean {
  return / {3,}/.test(value);
}

/**
 * 게시글 통합 검사
 * @returns 오류 메시지 또는 null
 */
export function validatePostText(value: string): string | null {
  if (hasPostBannedWord(value)) return "사용할 수 없는 단어가 포함되어 있어요.";
  if (hasExcessiveJamo(value)) return "초성·자모만으로는 작성할 수 없어요.";
  if (hasExcessiveSpaces(value)) return "공백을 너무 많이 사용했어요.";
  return null;
}

/**
 * 닉네임 로컬 유효성 검사 (DB 조회 제외)
 * @returns 오류 메시지 또는 null
 */
export function validateNicknameLocally(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "닉네임을 입력해주세요.";
  if (trimmed.length < NICKNAME_MIN_LENGTH) return `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 입력해주세요.`;
  if (trimmed.length > NICKNAME_MAX_LENGTH) return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`;
  if (hasInvalidChars(trimmed)) return "한글·영문·숫자만 사용할 수 있어요.";
  if (hasBannedWord(trimmed)) return "사용할 수 없는 단어가 포함되어 있어요.";
  return null;
}

/**
 * 마지막 변경일로부터 남은 쿨타임(일) 계산
 * @returns 0이면 변경 가능, 양수면 남은 일수
 */
export function getRemainingCooldownDays(lastChangedAt: string | null): number {
  if (!lastChangedAt) return 0;
  const last = new Date(lastChangedAt).getTime();
  const elapsed = (Date.now() - last) / (1000 * 60 * 60 * 24);
  const remaining = NICKNAME_CHANGE_COOLDOWN_DAYS - elapsed;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}
