// src/data/characterMessages.ts

export type MessageType = "greeting" | "cheer" | "witty" | "weather" | "lazy";

export interface CharacterMessage {
  text: string;
  type: MessageType;
  weatherCondition?: "sunny" | "cloudy" | "rainy" | "snow" | "hot" | "cold";
}

// ─── 날씨 조건별 공통 문구 (날씨 API 연동) ──────
export const WEATHER_MESSAGES: CharacterMessage[] = [
  {
    text: "빗소리 들으며 걷기, 꽤 감성적이잖아요 🌧️",
    type: "weather",
    weatherCondition: "rainy",
  },
  {
    text: "비 오는 날엔 실내 러닝머신도 좋아요 🏃",
    type: "weather",
    weatherCondition: "rainy",
  },
  {
    text: "우산 들고 가볍게 산책, 생각보다 개운해요 ☂️",
    type: "weather",
    weatherCondition: "rainy",
  },
  {
    text: "비 핑계로 헬스장 가는 날! 오늘이 딱이에요 💪",
    type: "weather",
    weatherCondition: "rainy",
  },
  {
    text: "실내 스트레칭만 해도 오늘 운동 인정! 🧘",
    type: "weather",
    weatherCondition: "rainy",
  },
  {
    text: "맑은 날씨네요! 걷기 딱 좋아요 ☀️",
    type: "weather",
    weatherCondition: "sunny",
  },
  {
    text: "햇살 좋은 날, 밖에 나가봐요 🌤️",
    type: "weather",
    weatherCondition: "sunny",
  },
  {
    text: "흐린 날엔 걷기가 오히려 편해요 🌥️",
    type: "weather",
    weatherCondition: "cloudy",
  },
  {
    text: "눈 오는 날 산책, 평생 기억에 남아요 ❄️",
    type: "weather",
    weatherCondition: "snow",
  },
  {
    text: "오늘 너무 더워요, 아침 일찍이나 실내 운동 어때요? 🌅",
    type: "weather",
    weatherCondition: "hot",
  },
  {
    text: "30도 넘는 날엔 야외 운동 강도를 줄여주세요. 오늘은 헬스장 어떠세요? 💪",
    type: "weather",
    weatherCondition: "hot",
  },
  {
    text: "이 더위엔 물 충분히 마시고, 무리하지 마세요 💧",
    type: "weather",
    weatherCondition: "hot",
  },
  {
    text: "꼭 나가야 한다면 그늘길 + 수분 보충은 필수예요 ☀️",
    type: "weather",
    weatherCondition: "hot",
  },
  {
    text: "오늘은 많이 춥네요. 준비운동 꼭 하고 나가세요 🧥",
    type: "weather",
    weatherCondition: "cold",
  },
  {
    text: "영하권엔 무릎이 다칠 수 있어요. 실내 운동도 좋아요 🏋️",
    type: "weather",
    weatherCondition: "cold",
  },
  {
    text: "쌀쌀한 날엔 마스크 쓰고 걸으면 훨씬 따뜻해요 🥶",
    type: "weather",
    weatherCondition: "cold",
  },
  {
    text: "추운 날 걸을 거라면 손발 먼저 따뜻하게 해주세요 🧤",
    type: "weather",
    weatherCondition: "cold",
  },
];

// ─── 캐릭터별 문구 ──────────────────────────────────────────
export const CHARACTER_MESSAGES: Record<string, CharacterMessage[]> = {
  walker: [
    // 인사
    { text: "오늘도 같이 걸어볼까요? 👣", type: "greeting" },
    { text: "천천히 걸어도 충분해요 🌿", type: "greeting" },
    { text: "산책 한 번 어때요? ☀️", type: "greeting" },
    { text: "오늘 하루도 한 걸음씩 🚶", type: "greeting" },
    { text: "걷는 것만으로도 대단한 거예요 👣", type: "greeting" },
    // 응원
    { text: "어제보다 한 걸음 더, 그걸로 충분해요 🌱", type: "cheer" },
    { text: "꾸준히 걷는 사람이 결국 이겨요 💪", type: "cheer" },
    { text: "오늘 걷기 싫어도 나가면 달라져요 🌈", type: "cheer" },
    { text: "작은 한 걸음이 큰 변화를 만들어요 ✨", type: "cheer" },
    { text: "걸을 때마다 몸이 고마워하고 있어요 🙏", type: "cheer" },
    // 재치
    { text: "엘리베이터 대신 계단? 이미 운동 시작 ㅋ", type: "witty" },
    { text: "편의점 다녀오는 것도 산책이에요 🏪", type: "witty" },
    { text: "산책하면서 유튜브 보면 두 배로 이득 🎧", type: "witty" },
    { text: "걷다 보면 오늘 뭐 먹을지 떠오름 🍚", type: "witty" },
    { text: "10분만 걸어봐요. 어차피 더 걷게 될걸요 😏", type: "witty" },
    //게으름
    { text: "오늘 산책 아직이에요? 저 기다리고 있었는데 👣", type: "lazy" },
    { text: "천천히라도 괜찮으니까 나가봐요 🌿", type: "lazy" },
    { text: "5분만 걸어도 안 한 것보단 나아요 😌", type: "lazy" },
    { text: "소파 온도가 딱 맞죠? 그래도 일어나요 🛋️", type: "lazy" },
    {
      text: "유튜브 알고리즘보다 내 다리 알고리즘을 믿어봐요 🎬",
      type: "lazy",
    },
  ],

  runner: [
    // 인사
    { text: "오늘도 같이 달려보자구! 🔥", type: "greeting" },
    { text: "러닝 시작할 준비 됐나요? ⚡", type: "greeting" },
    { text: "신발 끈 묶고 출발해봐요 👟", type: "greeting" },
    { text: "오늘의 러닝, 기다리고 있었어요 🏃", type: "greeting" },
    {
      text: "달리기 전엔 다들 귀찮아요. 달리고 나면 다들 뿌듯해요 😤",
      type: "greeting",
    },
    // 응원
    { text: "조금만 더 달려봐요 💨", type: "cheer" },
    { text: "1km 더, 딱 1km만 더 🔥", type: "cheer" },
    { text: "힘들 때가 진짜 운동되는 순간이에요 💪", type: "cheer" },
    { text: "포기하고 싶을 때 멈추지 마세요, 속도만 줄여요 🐢", type: "cheer" },
    { text: "지금 달리는 나, 한 달 뒤에 고마워할 거예요 🙌", type: "cheer" },
    // 재치
    { text: "러닝 중 음악 셔플이 신곡 틀어주면 속도 올라감 🎵", type: "witty" },
    { text: "달리고 나서 먹는 밥이 제일 맛있어요 🍖", type: "witty" },
    { text: "러닝 앱 켜두면 뭔가 더 열심히 달리게 됨 ㅋㅋ", type: "witty" },
    { text: "오늘 달린 거리, 내일 자랑해도 돼요 😄", type: "witty" },
    { text: "비 맞으며 달리면 영화 주인공 된 느낌 🎬", type: "witty" },
    // 게으름
    { text: "오늘 달리기 없음? 몸이 녹슬겠는데요 🔥", type: "lazy" },
    { text: "러닝화 먼지 쌓이고 있어요 지금 👟", type: "lazy" },
    { text: "딱 1km만요. 1km 후엔 더 달리고 싶어질 거예요 😏", type: "lazy" },
    { text: "소파 온도가 딱 맞죠? 그래도 일어나요 🛋️", type: "lazy" },
    {
      text: "유튜브 알고리즘보다 내 다리 알고리즘을 믿어봐요 🎬",
      type: "lazy",
    },
  ],

  hiker: [
    // 인사
    { text: "오늘 산 한 번 가볼까요? 🥾", type: "greeting" },
    { text: "등산화 신고 출발! 🌄", type: "greeting" },
    { text: "자연 속으로 걸어봐요 🌲", type: "greeting" },
    { text: "산이 오늘도 기다리고 있어요 🏔️", type: "greeting" },
    { text: "정상에서 보는 뷰, 올라가야 알 수 있어요 👀", type: "greeting" },
    // 응원
    { text: "정상까지 조금만 더요! 거의 다 왔어요 🏔️", type: "cheer" },
    { text: "숨 차도 괜찮아요, 그게 정상이에요 💨", type: "cheer" },
    { text: "내려올 때 무릎 조심, 올라갈 때 페이스 조심 🦵", type: "cheer" },
    { text: "산이 주는 에너지, 도시에선 못 얻어요 🌿", type: "cheer" },
    {
      text: "오늘 오른 계단 수, 엘리베이터 탄 사람과 비교불가 🏆",
      type: "cheer",
    },
    // 재치
    {
      text: "등산 간다고 했을 때 다들 말렸죠? 역시 혼자가 편해 ㅋ",
      type: "witty",
    },
    { text: "산 위에서 먹는 김밥은 미슐랭 3스타예요 🍙", type: "witty" },
    { text: "등산 앱 켜두면 고도 올라갈 때 뿌듯함 두 배 📈", type: "witty" },
    { text: "내려갈 때 무릎이 말을 걸어옴 '나 여기 있어' ㅋㅋ", type: "witty" },
    { text: "등산복 입으면 왜 전문가 된 것 같지 🧥", type: "witty" },
    //게으름
    { text: "산이 오늘도 기다렸는데... 🏔️", type: "lazy" },
    { text: "등산화 한 번 쳐다보기만 해도 기분 달라져요 🥾", type: "lazy" },
    { text: "가까운 공원이라도 어때요? 자연은 자연이니까 🌲", type: "lazy" },
    { text: "소파 온도가 딱 맞죠? 그래도 일어나요 🛋️", type: "lazy" },
    {
      text: "유튜브 알고리즘보다 내 다리 알고리즘을 믿어봐요 🎬",
      type: "lazy",
    },
  ],

  power_walker: [
    // 인사
    { text: "파워워킹 시작해봐요! 💪", type: "greeting" },
    { text: "오늘 목표 달성 가즈아! 🔥", type: "greeting" },
    { text: "빠르게 걸을수록 좋아요 🚶", type: "greeting" },
    { text: "팔 흔들고 보폭 넓게, 출발! ⚡", type: "greeting" },
    {
      text: "걷는 건데 왜 이렇게 뿌듯하지? 그게 파워워킹 😤",
      type: "greeting",
    },
    // 응원
    { text: "목표 달성까지 얼마 안 남았어요! 🎯", type: "cheer" },
    { text: "속도 유지해요, 잘 하고 있어요 💨", type: "cheer" },
    { text: "오늘 걸음수 어제 넘어설 수 있어요 📈", type: "cheer" },
    { text: "칼로리 활활 태우는 중 🔥", type: "cheer" },
    { text: "이 속도면 한 달 후 완전 달라져 있을 거예요 ✨", type: "cheer" },
    // 재치
    {
      text: "파워워킹은 달리기보다 멋있어요. 여유 있어 보이잖아요 😎",
      type: "witty",
    },
    { text: "빠르게 걷다 보면 앞사람 추월하고 싶어짐 ㅋ", type: "witty" },
    {
      text: "이어폰에서 신나는 노래 나오면 나도 모르게 속도 업 🎵",
      type: "witty",
    },
    { text: "파워워킹 중에 전화 오면 숨차서 티남 ㅋㅋ 📱", type: "witty" },
    { text: "걷기인데 달리기보다 칼로리 더 탈 때도 있음 😏", type: "witty" },
    //게으름
    { text: "오늘 걸음수 0이면 내일 목표 두 배예요 😤", type: "lazy" },
    { text: "파워워커가 쉬는 날? 그런 거 없어요 💪", type: "lazy" },
    { text: "일어나서 신발만 신어봐요. 그다음은 자동이에요 ⚡", type: "lazy" },
    { text: "소파 온도가 딱 맞죠? 그래도 일어나요 🛋️", type: "lazy" },
    {
      text: "유튜브 알고리즘보다 내 다리 알고리즘을 믿어봐요 🎬",
      type: "lazy",
    },
  ],
};

// ─── 랜덤 메시지 가져오기 ────────────────────────────────────
export function getRandomMessage(
  characterId: string,
  type?: MessageType,
): string {
  const messages =
    CHARACTER_MESSAGES[characterId] ?? CHARACTER_MESSAGES["walker"];
  const filtered = type ? messages.filter((m) => m.type === type) : messages;
  const pool = filtered.length > 0 ? filtered : messages;
  return pool[Math.floor(Math.random() * pool.length)].text;
}

export function getMessageBySteps(characterId: string, steps: number): string {
  if (steps === 0) {
    // 0보: 레이지만
    return getRandomMessage(characterId, "lazy");
  }
  if (steps < 2000) {
    // 걷고는 있으니까 응원!
    return getRandomMessage(characterId, "cheer");
  }
  if (steps >= 5000) {
    // 5천보 이상: 칭찬/응원
    return getRandomMessage(characterId, "cheer");
  }
  // 2천~5천: 전체 랜덤
  return getRandomMessage(characterId);
}

// ─── 날씨 메시지 가져오기 (나중에 날씨 API 연동시 사용) ────────
export function getWeatherMessage(
  condition: CharacterMessage["weatherCondition"],
): string | null {
  const filtered = WEATHER_MESSAGES.filter(
    (m) => m.weatherCondition === condition,
  );
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)].text;
}
