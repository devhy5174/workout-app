import { useState, useEffect } from "react";
import type { CharacterMessage } from "../data/characterMessages";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
const CACHE_KEY = "weather_cache_v1";
const CACHE_TTL = 10 * 60 * 1000;

export type WeatherData = {
  city: string;
  temp: number;
  code: number;
  isDay: boolean;
};

export type WeatherCondition = CharacterMessage["weatherCondition"];

export function codeToCondition(code: number, temp: number): WeatherCondition {
  if (temp >= 30) return "hot";
  if (temp <= 4) return "cold";
  if (code >= 200 && code < 600) return "rainy";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "cloudy";
  if (code === 800) return "sunny";
  return "cloudy";
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!API_KEY) return;

    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { fetchedAt, ...data } = JSON.parse(raw) as WeatherData & {
          fetchedAt: number;
        };
        if (Date.now() - fetchedAt < CACHE_TTL) {
          setWeather(data);
          return;
        }
      }
    } catch {}

    // Nominatim 역지오코딩으로 한국어 지역명 반환 (동 > 구 > 시 우선순위)
    const fetchKoreanCity = async (lat: number, lon: number): Promise<string> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`,
          { headers: { "User-Agent": "togetherwalk-app" } },
        );
        if (!res.ok) return "";
        const d = await res.json();
        const a = d.address ?? {};
        return (
          a.suburb ?? a.quarter ?? a.borough ??
          a.city_district ?? a.county ?? a.city ?? ""
        );
      } catch {
        return "";
      }
    };

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const [res, korCity] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`,
          ),
          fetchKoreanCity(latitude, longitude),
        ]);
        if (!res.ok) return;
        const d = await res.json();
        const now = Date.now();
        const data: WeatherData = {
          city: korCity || d.name,
          temp: Math.round(d.main.temp),
          code: d.weather[0].id,
          isDay: now > d.sys.sunrise * 1000 && now < d.sys.sunset * 1000,
        };
        setWeather(data);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ ...data, fetchedAt: now }),
        );
      } catch (e) {
        console.log("fetch 에러", e);
      }
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) =>
        fetchWeather(latitude, longitude),
      (err) => {
        console.log("위치 실패", err);
        fetchWeather(37.5665, 126.978);
      },
      { timeout: 5000 },
    );
  }, []);

  const condition = weather
    ? codeToCondition(weather.code, weather.temp)
    : undefined;

  return { weather, condition };
}
