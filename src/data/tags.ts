export type PartyTag = {
  id: number;
  name: string;
};

export const PARTY_TAGS: PartyTag[] = [
  { id: 1, name: "산책" },
  { id: 2, name: "파워워킹" },
  { id: 3, name: "러닝" },
  { id: 4, name: "등산" },
];

export type CommunityTagGroup = {
  title: string;
  tags: string[];
};

export const COMMUNITY_TAG_GROUPS: CommunityTagGroup[] = [
  {
    title: "걷기 · 러닝",
    tags: [
      "아침산책",
      "밤산책",
      "천천히걷기",
      "파워워킹",
      "러닝시작",
      "러너모드",
      "등산완료",
      "오르막도전",
    ],
  },
  {
    title: "일상 운동",
    tags: ["출근길걷기", "퇴근후운동", "운동기록"],
  },
  {
    title: "목표 · 성취",
    tags: ["오늘도성공", "목표달성"],
  },
  {
    title: "감정 · 다짐",
    tags: ["귀찮았지만성공", "같이걷는중"],
  },
];
