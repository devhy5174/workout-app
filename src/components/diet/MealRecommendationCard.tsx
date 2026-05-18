import type { ReactNode } from "react";
import type { RecommendedMenu } from "../../data/diet";
import type { ScaledFood } from "../../utils/dietScaling";

interface MealRecommendationCardProps {
  label: string;
  menu: RecommendedMenu;
  personalizedMealKcal: number;
  scaledFoods: ScaledFood[];
  headerAction?: ReactNode;
}

export default function MealRecommendationCard({
  label,
  menu,
  personalizedMealKcal,
  scaledFoods,
  headerAction,
}: MealRecommendationCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-extrabold text-gray-800">{label} 추천</p>
        {headerAction}
        <span className="text-[11px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5 ml-auto">
          {personalizedMealKcal} kcal
        </span>
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-2xl flex-shrink-0">{menu.emoji}</span>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm">{menu.name}</p>
          <p className="text-xs text-gray-400">{menu.description}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {scaledFoods.map((food) => (
          <span
            key={food.name}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-gray-50 border border-gray-100"
          >
            {food.emoji} {food.name}
            <span className="text-gray-400 ml-0.5">{food.kcal}kcal</span>
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {menu.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">
          ⏱ {menu.prepTime}분
        </span>
      </div>
    </div>
  );
}
