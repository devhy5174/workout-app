import character01 from "../assets/images/characters/character_01.webp";
import character02 from "../assets/images/characters/character_02.webp";
import character03 from "../assets/images/characters/character_03.webp";
import character04 from "../assets/images/characters/character_04.webp";
import character05 from "../assets/images/characters/character_05.webp";
import character06 from "../assets/images/characters/character_06.webp";
import character07 from "../assets/images/characters/character_07.webp";
import character08 from "../assets/images/characters/character_08.webp";
import character09 from "../assets/images/characters/character_09.webp";
import character10 from "../assets/images/characters/character_10.webp";
import character11 from "../assets/images/characters/character_11.webp";
import character12 from "../assets/images/characters/character_12.webp";
import character13 from "../assets/images/characters/character_13.webp";
import character14 from "../assets/images/characters/character_14.webp";
import character15 from "../assets/images/characters/character_15.webp";
import character16 from "../assets/images/characters/character_16.webp";
import character17 from "../assets/images/characters/character_17.webp";
import character18 from "../assets/images/characters/character_18.webp";
import character19 from "../assets/images/characters/character_19.webp";
import character20 from "../assets/images/characters/character_20.webp";
import character21 from "../assets/images/characters/character_21.webp";
import character22 from "../assets/images/characters/character_22.webp";
import character23 from "../assets/images/characters/character_23.webp";
import character24 from "../assets/images/characters/character_24.webp";
import character25 from "../assets/images/characters/character_25.webp";
import character26 from "../assets/images/characters/character_26.webp";
import character27 from "../assets/images/characters/character_27.webp";
import character28 from "../assets/images/characters/character_28.webp";
import character29 from "../assets/images/characters/character_29.webp";
import character30 from "../assets/images/characters/character_30.webp";

export type AvatarCharacter = {
  id: string;
  image: string;
};

export const avatarCharacters: AvatarCharacter[] = [
  { id: "character_01", image: character01 },
  { id: "character_02", image: character02 },
  { id: "character_03", image: character03 },
  { id: "character_04", image: character04 },
  { id: "character_05", image: character05 },
  { id: "character_06", image: character06 },
  { id: "character_07", image: character07 },
  { id: "character_08", image: character08 },
  { id: "character_09", image: character09 },
  { id: "character_10", image: character10 },
  { id: "character_11", image: character11 },
  { id: "character_12", image: character12 },
  { id: "character_13", image: character13 },
  { id: "character_14", image: character14 },
  { id: "character_15", image: character15 },
  { id: "character_16", image: character16 },
  { id: "character_17", image: character17 },
  { id: "character_18", image: character18 },
  { id: "character_19", image: character19 },
  { id: "character_20", image: character20 },
  { id: "character_21", image: character21 },
  { id: "character_22", image: character22 },
  { id: "character_23", image: character23 },
  { id: "character_24", image: character24 },
  { id: "character_25", image: character25 },
  { id: "character_26", image: character26 },
  { id: "character_27", image: character27 },
  { id: "character_28", image: character28 },
  { id: "character_29", image: character29 },
  { id: "character_30", image: character30 },
];

export const getAvatarCharacterById = (id: string | null | undefined) =>
  avatarCharacters.find((character) => character.id === id) ?? null;
