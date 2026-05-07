// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type CharacterType =
  | "walker"
  | "sprinter"
  | "yoga"
  | "powerlifter"
  | "swimmer"
  | "adventurer";

export interface DietMacros {
  protein: number; // 목표 비율 (%)
  carbs: number;
  fat: number;
}

export interface CharacterDietProfile {
  description: string;
  dailyKcalTarget: number;
  macros: DietMacros;
  focus: string[];           // 식단 핵심 키워드
  recommendedFoods: string[];
  avoidFoods: string[];
  mealTip: string;
}

export interface Character {
  id: number;
  type: CharacterType;
  emoji: string;
  name: string;
  style: string;
  bonus: string;
  bonusIcon: string;
  gradient: string;   // Tailwind gradient class
  bg: string;         // Tailwind bg class (선택 시)
  border: string;     // Tailwind border class (선택 시)
  dietProfile: CharacterDietProfile;
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

export const characters: Character[] = [
  {
    id: 1,
    type: "walker",
    emoji: "🚶",
    name: "워커",
    style: "매일 꾸준한 산책",
    bonus: "연속 운동 포인트 2배",
    bonusIcon: "🔥",
    gradient: "from-green-400 to-teal-400",
    bg: "bg-green-50",
    border: "border-green-400",
    dietProfile: {
      description: "꾸준한 산책엔 가벼운 저칼로리 식단이 딱!",
      dailyKcalTarget: 1800,
      macros: { protein: 20, carbs: 55, fat: 25 },
      focus: ["저칼로리", "식이섬유", "수분 충전"],
      recommendedFoods: ["현미밥", "나물반찬", "두부", "과일", "두유"],
      avoidFoods: ["튀긴 음식", "고열량 디저트", "탄산음료"],
      mealTip: "산책 전 가벼운 간식으로 에너지를 충전하세요.",
    },
  },
  {
    id: 2,
    type: "sprinter",
    emoji: "🏃",
    name: "스프린터",
    style: "단거리 질주 특화",
    bonus: "목표 달성 포인트 2배",
    bonusIcon: "⚡",
    gradient: "from-orange-400 to-red-400",
    bg: "bg-orange-50",
    border: "border-orange-400",
    dietProfile: {
      description: "폭발적 에너지를 위한 탄수화물·단백질 균형 식단",
      dailyKcalTarget: 2200,
      macros: { protein: 30, carbs: 50, fat: 20 },
      focus: ["고단백", "빠른 회복", "탄수화물 보충"],
      recommendedFoods: ["바나나", "닭가슴살", "현미밥", "프로틴쉐이크", "초코우유"],
      avoidFoods: ["기름진 음식", "술", "과도한 설탕"],
      mealTip: "운동 30분 전 바나나 한 개로 빠른 에너지를 공급하세요.",
    },
  },
  {
    id: 3,
    type: "yoga",
    emoji: "🧘",
    name: "요가마스터",
    style: "꾸준함과 마음의 균형",
    bonus: "7일 연속 달성 보너스",
    bonusIcon: "✨",
    gradient: "from-purple-400 to-pink-400",
    bg: "bg-purple-50",
    border: "border-purple-400",
    dietProfile: {
      description: "몸과 마음의 균형을 위한 항염·식물성 식단",
      dailyKcalTarget: 1700,
      macros: { protein: 20, carbs: 50, fat: 30 },
      focus: ["항염식품", "식물성 단백질", "마음 안정"],
      recommendedFoods: ["그릭요거트", "아보카도", "견과류", "그린스무디", "두부"],
      avoidFoods: ["가공식품", "인공첨가물", "카페인 과다"],
      mealTip: "요가 전 2시간은 과식을 피하고 소화가 쉬운 음식을 드세요.",
    },
  },
  {
    id: 4,
    type: "powerlifter",
    emoji: "🏋️",
    name: "파워리프터",
    style: "집중 고강도 운동",
    bonus: "주간 목표 달성 보너스",
    bonusIcon: "💪",
    gradient: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-400",
    dietProfile: {
      description: "근육 합성 극대화를 위한 고단백 고칼로리 식단",
      dailyKcalTarget: 2800,
      macros: { protein: 35, carbs: 45, fat: 20 },
      focus: ["근합성", "고단백", "칼로리 서플러스"],
      recommendedFoods: ["소고기", "계란", "닭가슴살", "연어", "퀴노아", "고구마"],
      avoidFoods: ["빈 칼로리 음식", "술", "과도한 당류"],
      mealTip: "운동 직후 30분 이내에 단백질 30g 이상을 섭취하세요.",
    },
  },
  {
    id: 5,
    type: "swimmer",
    emoji: "🌊",
    name: "스위머",
    style: "물 속에서 온몸 단련",
    bonus: "포인트 1.5배 적립",
    bonusIcon: "💎",
    gradient: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-400",
    dietProfile: {
      description: "수영 전후 에너지 보충과 전해질 균형 식단",
      dailyKcalTarget: 2400,
      macros: { protein: 25, carbs: 55, fat: 20 },
      focus: ["전해질 보충", "지구력", "수분 섭취"],
      recommendedFoods: ["오트밀", "연어", "바나나", "스포츠이온음료", "아몬드"],
      avoidFoods: ["수영 직전 과식", "기름진 음식", "탄산음료"],
      mealTip: "수영 후 전해질 음료와 탄수화물로 빠르게 에너지를 회복하세요.",
    },
  },
  {
    id: 6,
    type: "adventurer",
    emoji: "🚵",
    name: "어드벤처러",
    style: "야외 등산 & 탐험",
    bonus: "파티 참여 보너스",
    bonusIcon: "🗺️",
    gradient: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    dietProfile: {
      description: "장시간 야외 활동을 위한 지속 에너지 공급 식단",
      dailyKcalTarget: 2500,
      macros: { protein: 25, carbs: 50, fat: 25 },
      focus: ["지속 에너지", "휴대 간편", "전해질"],
      recommendedFoods: ["에너지바", "견과류", "건과일", "닭가슴살 도시락", "고구마"],
      avoidFoods: ["무거운 음식", "빠른 소화 당류", "가공스낵"],
      mealTip: "등산 전날 탄수화물을 충분히 섭취해 글리코겐을 채우세요.",
    },
  },
];

export const getCharacterByType = (type: CharacterType): Character | undefined =>
  characters.find((c) => c.type === type);
