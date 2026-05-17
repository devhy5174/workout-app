import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloudy,
  WiRain,
  WiDaySprinkle,
  WiSnow,
  WiThunderstorm,
  WiDayFog,
} from "react-icons/wi";
import type { WeatherData } from "../../hooks/useWeather";

function WeatherIcon({ code, isDay }: { code: number; isDay: boolean }) {
  const size = 22;
  if (code >= 200 && code < 300)
    return <WiThunderstorm size={size} className="text-violet-400" />;
  if (code >= 300 && code < 400)
    return <WiDaySprinkle size={size} className="text-blue-400" />;
  if (code >= 500 && code < 600)
    return <WiRain size={size} className="text-blue-500" />;
  if (code >= 600 && code < 700)
    return <WiSnow size={size} className="text-sky-400" />;
  if (code >= 700 && code < 800)
    return <WiDayFog size={size} className="text-gray-400" />;
  if (code === 800)
    return isDay ? (
      <WiDaySunny size={size} className="text-yellow-400" />
    ) : (
      <WiNightClear size={size} className="text-indigo-300" />
    );
  if (code <= 802)
    return isDay ? (
      <WiDayCloudy size={size} className="text-yellow-300" />
    ) : (
      <WiNightAltCloudy size={size} className="text-gray-400" />
    );
  return <WiCloudy size={size} className="text-gray-400" />;
}

export default function WeatherWidget({
  weather,
}: {
  weather: WeatherData | null;
}) {
  if (!weather) return null;

  return (
    <div className="bg-white rounded-full px-3 py-1.5 shadow-sm flex items-center gap-0.5">
      <WeatherIcon code={weather.code} isDay={weather.isDay} />
      <span className="text-xs font-bold text-gray-600 ml-0.5">
        {weather.city}
      </span>
      <span
        className="text-xs font-extrabold ml-1"
        style={{ color: "var(--color-primary)" }}
      >
        {weather.temp}°
      </span>
    </div>
  );
}
