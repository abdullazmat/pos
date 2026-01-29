const LANGUAGE_LOCALE: Record<string, string> = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
};

export const normalizeCountry = (value?: string) => {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const COUNTRY_TIMEZONE_MAP: Record<
  string,
  { locale: string; timeZone: string }
> = {
  argentina: { locale: "es-AR", timeZone: "America/Argentina/Buenos_Aires" },
  chile: { locale: "es-CL", timeZone: "America/Santiago" },
  peru: { locale: "es-PE", timeZone: "America/Lima" },
  uruguay: { locale: "es-UY", timeZone: "America/Montevideo" },
  paraguay: { locale: "es-PY", timeZone: "America/Asuncion" },
  bolivia: { locale: "es-BO", timeZone: "America/La_Paz" },
  colombia: { locale: "es-CO", timeZone: "America/Bogota" },
  mexico: { locale: "es-MX", timeZone: "America/Mexico_City" },
  espana: { locale: "es-ES", timeZone: "Europe/Madrid" },
  spain: { locale: "es-ES", timeZone: "Europe/Madrid" },
  brazil: { locale: "pt-BR", timeZone: "America/Sao_Paulo" },
  brasil: { locale: "pt-BR", timeZone: "America/Sao_Paulo" },
  portugal: { locale: "pt-PT", timeZone: "Europe/Lisbon" },
  usa: { locale: "en-US", timeZone: "America/New_York" },
  "united states": { locale: "en-US", timeZone: "America/New_York" },
  "united states of america": {
    locale: "en-US",
    timeZone: "America/New_York",
  },
  canada: { locale: "en-CA", timeZone: "America/Toronto" },
  uk: { locale: "en-GB", timeZone: "Europe/London" },
  "united kingdom": { locale: "en-GB", timeZone: "Europe/London" },
  ireland: { locale: "en-IE", timeZone: "Europe/Dublin" },
  france: { locale: "fr-FR", timeZone: "Europe/Paris" },
  germany: { locale: "de-DE", timeZone: "Europe/Berlin" },
  italy: { locale: "it-IT", timeZone: "Europe/Rome" },
  netherlands: { locale: "nl-NL", timeZone: "Europe/Amsterdam" },
  belgium: { locale: "nl-BE", timeZone: "Europe/Brussels" },
  sweden: { locale: "sv-SE", timeZone: "Europe/Stockholm" },
  norway: { locale: "nb-NO", timeZone: "Europe/Oslo" },
  finland: { locale: "fi-FI", timeZone: "Europe/Helsinki" },
  denmark: { locale: "da-DK", timeZone: "Europe/Copenhagen" },
  austria: { locale: "de-AT", timeZone: "Europe/Vienna" },
  switzerland: { locale: "de-CH", timeZone: "Europe/Zurich" },
  australia: { locale: "en-AU", timeZone: "Australia/Sydney" },
  "new zealand": { locale: "en-NZ", timeZone: "Pacific/Auckland" },
  ecuador: { locale: "es-EC", timeZone: "America/Guayaquil" },
  venezuela: { locale: "es-VE", timeZone: "America/Caracas" },
  guatemala: { locale: "es-GT", timeZone: "America/Guatemala" },
  panama: { locale: "es-PA", timeZone: "America/Panama" },
  "costa rica": { locale: "es-CR", timeZone: "America/Costa_Rica" },
  nicaragua: { locale: "es-NI", timeZone: "America/Managua" },
  honduras: { locale: "es-HN", timeZone: "America/Tegucigalpa" },
  "el salvador": { locale: "es-SV", timeZone: "America/El_Salvador" },
  "dominican republic": {
    locale: "es-DO",
    timeZone: "America/Santo_Domingo",
  },
  pakistan: { locale: "en-PK", timeZone: "Asia/Karachi" },
  india: { locale: "en-IN", timeZone: "Asia/Kolkata" },
  bangladesh: { locale: "bn-BD", timeZone: "Asia/Dhaka" },
  china: { locale: "zh-CN", timeZone: "Asia/Shanghai" },
  japan: { locale: "ja-JP", timeZone: "Asia/Tokyo" },
  "south korea": { locale: "ko-KR", timeZone: "Asia/Seoul" },
  korea: { locale: "ko-KR", timeZone: "Asia/Seoul" },
};

export const resolveCountryLocaleTimeZone = (
  country?: string,
  language?: string,
) => {
  const key = normalizeCountry(country);
  const normalizedLanguage = (language || "").trim().toLowerCase();
  return (
    COUNTRY_TIMEZONE_MAP[key] || {
      locale: LANGUAGE_LOCALE[normalizedLanguage] || "es-AR",
      timeZone: "America/Argentina/Buenos_Aires",
    }
  );
};

export const formatWithCountry = (
  value: string | Date | undefined,
  country: string | undefined,
  language?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const { locale, timeZone } = resolveCountryLocaleTimeZone(country, language);
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    ...options,
  }).format(date);
};
