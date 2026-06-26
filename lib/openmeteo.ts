import type { Weather } from "./types";

const WMO: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna leve",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia leve",
  63: "Lluvia",
  65: "Lluvia intensa",
  71: "Nieve leve",
  73: "Nieve",
  75: "Nieve intensa",
  80: "Chaparrones",
  81: "Chaparrones",
  82: "Chaparrones fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo",
};

export function describeWeather(code: number): string {
  return WMO[code] ?? "—";
}

export async function getWeather(lat: number, lon: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&timezone=America%2FArgentina%2FCordoba&forecast_days=3`;

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  const cw = data.current_weather;
  const daily = data.daily;

  return {
    temperature: cw.temperature,
    windspeed: cw.windspeed,
    weatherCode: cw.weathercode,
    description: describeWeather(cw.weathercode),
    time: cw.time,
    forecast: daily.time.map((date: string, i: number) => ({
      date,
      tMax: daily.temperature_2m_max[i],
      tMin: daily.temperature_2m_min[i],
      code: daily.weathercode[i],
    })),
  };
}
