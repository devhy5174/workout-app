import { supabase } from "./supabase";

/**
 * 닉네임 중복 여부 확인 (대소문자 구분 없음)
 * @returns isDuplicate: true면 이미 사용 중
 */
export async function checkNicknameDuplicate(
  nickname: string,
  currentUserId: string,
): Promise<{ isDuplicate: boolean; error: string | null }> {
  // app_users는 본인 행만 읽을 수 있으므로 public_profiles(UNRESTRICTED) 사용
  let query = supabase
    .from("public_profiles")
    .select("id")
    .ilike("nickname", nickname);

  // 온보딩처럼 userId가 없으면 전체 대상 검사, 설정 변경이면 본인 제외
  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return { isDuplicate: false, error: error.message };
  return { isDuplicate: !!data, error: null };
}
