import { avatarCharacters } from "./avatarCharacters";

export type FakeUser = {
  nickname: string;
  character_id: string;
  character_image: string;
  steps: number;
  activity: string;
};

const c = avatarCharacters;

export const FAKE_ACTIVE_USERS: FakeUser[] = [
  { nickname: "희연", character_id: c[2].id, character_image: c[2].image, steps: 6240, activity: "산책 중" },
  { nickname: "민준", character_id: c[7].id, character_image: c[7].image, steps: 8103, activity: "러닝 중" },
  { nickname: "소은", character_id: c[14].id, character_image: c[14].image, steps: 4581, activity: "등산 중" },
  { nickname: "지안", character_id: c[21].id, character_image: c[21].image, steps: 3940, activity: "파워워킹 중" },
  { nickname: "준서", character_id: c[5].id, character_image: c[5].image, steps: 5820, activity: "러닝 중" },
  { nickname: "나연", character_id: c[11].id, character_image: c[11].image, steps: 7200, activity: "산책 중" },
  { nickname: "태양", character_id: c[17].id, character_image: c[17].image, steps: 9100, activity: "파워워킹 중" },
];
